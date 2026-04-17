import { NextRequest, NextResponse } from "next/server";
import { col } from "@/lib/firestore";
import { createOrder } from "@/lib/db/orders";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_PROMPT = `Tu es l'assistant téléphonique de la pizzeria "Au Paradizzio" à Entraigues-sur-la-Sorgue.
Tu parles au téléphone avec un client. Sois bref et clair (max 2-3 phrases par réponse).

MENU PIZZAS (29cm / 33cm / 40cm):
- Margherita: 8,50€ / 10,50€ / 14,50€
- 4 Fromages: 10,50€ / 12,50€ / 17€
- Reine: 9,50€ / 11,50€ / 15,50€
- Calzone: 11€ / 13€ / 17,50€
- Végétarienne: 10€ / 12€ / 16€
- Corsica: 12€ / 14€ / 18€

DESSERTS: Tiramisu 5,50€, Panna Cotta 5€
BOISSONS: Coca 2,50€, Eau 2€, Bière 4€

MODES: Livraison (3€, gratuit dès 25€), À emporter, Sur place
HORAIRES: Mar-Dim 17h30-21h30 (22h ven-sam), Fermé lundi
ADRESSE: 711 Route de Carpentras, 84320 Entraigues

RÈGLES:
1. Sois chaleureux mais BREF (c'est un appel téléphonique)
2. Propose la 33cm par défaut
3. Quand la commande est complète, demande nom + téléphone + mode (livraison/emporter)
4. Pour livraison, demande l'adresse
5. Récapitule avant de confirmer
6. Quand le client confirme, termine par [COMMANDE_PRÊTE] suivi du JSON

FORMAT COMMANDE:
[COMMANDE_PRÊTE]{"items":[{"name":"Margherita","size":"33 cm","quantity":1,"unitPrice":10.5,"totalPrice":10.5}],"customerName":"...","customerPhone":"...","mode":"DELIVERY|TAKEAWAY","address":"...","total":...}`;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

async function callGemini(history: ChatMessage[], userMessage: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Compris, je suis prêt à prendre les commandes par téléphone." }] },
    ...history,
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, pouvez-vous répéter ?";
}

// Twilio calls this when the customer has spoken
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callSid = formData.get("CallSid") as string;
  const speechResult = formData.get("SpeechResult") as string;
  const from = formData.get("From") as string;

  if (!speechResult) {
    // No speech detected, ask again
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="fr-FR" speechTimeout="3" timeout="10" action="/api/twilio/gather" method="POST">
    <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
      Excusez-moi, je n'ai pas entendu. Pouvez-vous répéter ?
    </Say>
  </Gather>
  <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">Au revoir !</Say>
</Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  try {
    // Get conversation history from Firestore
    const callDoc = await col.storeSettings.doc(`call-${callSid}`).get();
    const callData = callDoc.exists ? callDoc.data() : { history: [] };
    const history: ChatMessage[] = (callData?.history ?? []) as ChatMessage[];

    // Call Gemini
    const botResponse = await callGemini(history, speechResult);

    // Check for completed order
    let orderConfirmation = "";
    if (botResponse.includes("[COMMANDE_PRÊTE]")) {
      const jsonMatch = botResponse.match(/\[COMMANDE_PRÊTE\]\s*(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          const orderData = JSON.parse(jsonMatch[1]);

          // Create the order in Firestore
          const deliveryFee = orderData.mode === "DELIVERY" ? 3 : 0;
          const subtotal = orderData.items.reduce((s: number, i: { totalPrice: number }) => s + i.totalPrice, 0);
          const order = await createOrder({
            userId: null,
            customerName: orderData.customerName || "Client téléphone",
            customerPhone: orderData.customerPhone || from || "",
            customerEmail: null,
            mode: orderData.mode || "TAKEAWAY",
            subtotal,
            deliveryFee,
            discount: 0,
            total: subtotal + deliveryFee,
            promoCode: null,
            deliveryAddress: orderData.address || null,
            paymentMethod: "cash",
            notes: `Commande par téléphone (${from || "inconnu"})`,
            items: orderData.items.map((item: { name: string; size: string; quantity: number; unitPrice: number; totalPrice: number }) => ({
              productId: item.name.toLowerCase().replace(/\s/g, "-"),
              productName: item.name,
              sizeName: item.size || "33 cm",
              sizePrice: item.unitPrice,
              quantity: item.quantity,
              supplements: [],
              removedIngredients: [],
              specialInstructions: "",
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          });

          orderConfirmation = ` Votre numéro de commande est ${order.orderNumber}. `;

          // Clean up call history
          await col.storeSettings.doc(`call-${callSid}`).delete();
        } catch (e) {
          console.error("Error creating phone order:", e);
        }
      }
    }

    // Update conversation history
    const updatedHistory = [
      ...history,
      { role: "user" as const, parts: [{ text: speechResult }] },
      { role: "model" as const, parts: [{ text: botResponse }] },
    ];

    await col.storeSettings.doc(`call-${callSid}`).set({
      callSid,
      from,
      history: updatedHistory.slice(-20), // Keep last 20 messages
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Clean bot response for speech
    const cleanResponse = botResponse.replace(/\[COMMANDE_PRÊTE\]\s*\{[\s\S]*\}/, "").trim();
    const spokenText = cleanResponse + orderConfirmation;

    // If order was placed, say goodbye
    if (orderConfirmation) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
    ${escapeXml(spokenText)}
    Merci pour votre commande chez Au Paradizzio. À très bientôt !
  </Say>
  <Hangup/>
</Response>`;
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    // Continue the conversation
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="fr-FR" speechTimeout="3" timeout="15" action="/api/twilio/gather" method="POST">
    <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
      ${escapeXml(spokenText)}
    </Say>
  </Gather>
  <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
    Êtes-vous toujours là ? N'hésitez pas à rappeler. Au revoir !
  </Say>
</Response>`;

    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (error) {
    console.error("Twilio gather error:", error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
    Désolé, j'ai rencontré un problème technique. Veuillez rappeler dans quelques instants. Au revoir.
  </Say>
  <Hangup/>
</Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

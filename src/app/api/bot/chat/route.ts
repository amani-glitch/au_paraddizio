import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface CartItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BotState {
  cart: CartItem[];
  step: "greeting" | "ordering" | "details" | "payment" | "confirmed";
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  mode?: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  address?: string;
}

const SYSTEM_PROMPT = `Tu es l'assistant téléphonique et en ligne de la pizzeria "Au Paradizzio", située à Entraigues-sur-la-Sorgue.
Tu prends les commandes des clients par chat/téléphone de manière professionnelle et chaleureuse.

MENU ET PRIX:
PIZZAS (3 tailles: 29cm, 33cm, 40cm):
- Margherita: 8,50€ / 10,50€ / 14,50€ - Sauce tomate, mozzarella, basilic frais
- 4 Fromages: 10,50€ / 12,50€ / 17,00€ - Mozzarella, gorgonzola, parmesan, chèvre
- Reine: 10,00€ / 12,00€ / 16,00€ - Sauce tomate, mozzarella, jambon, champignons
- Napolitaine: 9,50€ / 11,50€ / 15,50€ - Sauce tomate, mozzarella, anchois, câpres, olives
- Calzone: 11,00€ / 13,00€ / 17,50€ - Pliée, sauce tomate, mozzarella, jambon, oeuf
- Sicilienne: 11,00€ / 13,00€ / 17,50€ - Sauce tomate, mozzarella, poivrons, aubergines, oignons
- Campagnarde: 10,50€ / 12,50€ / 17,00€ - Crème fraîche, mozzarella, pommes de terre, lardons, oignons
- Royale: 11,50€ / 13,50€ / 18,00€ - Sauce tomate, mozzarella, jambon, champignons, olives, artichauts
- Diavola: 10,50€ / 12,50€ / 17,00€ - Sauce tomate, mozzarella, salami piquant, piments
- Végétarienne: 10,00€ / 12,00€ / 16,00€ - Sauce tomate, mozzarella, légumes grillés, roquette

ENTRÉES & SALADES:
- Bruschetta classique: 5,50€
- Salade César: 8,50€
- Antipasti mixte: 9,00€

DESSERTS:
- Tiramisu maison: 6,50€
- Panna cotta: 5,50€
- Fondant au chocolat: 6,00€

BOISSONS:
- Coca-Cola 33cl: 2,50€
- Eau minérale 50cl: 1,50€
- Bière artisanale 33cl: 4,00€
- Vin rouge (verre): 3,50€

SUPPLÉMENTS: Extra mozzarella (+1,50€), Extra jambon (+2,00€), Extra champignons (+1,50€)

CODES PROMO: BIENVENUE (-10%), PIZZA10 (-10€), LIVRAISON (livraison gratuite)

INFOS PRATIQUES:
- Horaires: Mar-Dim 11h30-14h00, 18h00-22h00. Fermé le lundi.
- Modes: Livraison (3€, gratuit dès 25€), À emporter, Sur place
- Zones de livraison: Entraigues (84320), Sorgues (84700), Monteux (84170)
- Téléphone: 04 90 XX XX XX
- Paiement: CB, espèces, Apple Pay, Google Pay

RÈGLES DE CONVERSATION:
1. Sois chaleureux, professionnel et efficace
2. Propose la taille 33cm par défaut si le client ne précise pas
3. Propose toujours un dessert et une boisson avec la commande
4. Récapitule la commande avant de confirmer
5. Demande le nom, téléphone, mode (livraison/emporter/sur place)
6. Pour la livraison, demande l'adresse complète
7. Calcule le total correctement
8. Si le client hésite, recommande les best-sellers: Margherita, 4 Fromages, Royale
9. Réponds TOUJOURS en français
10. Quand la commande est complète et confirmée par le client, termine par "[COMMANDE_PRÊTE]" suivi du JSON de la commande

FORMAT DE COMMANDE FINALE (quand le client confirme):
Après confirmation, ajoute à la fin de ta réponse:
[COMMANDE_PRÊTE]{"items":[{"name":"Margherita","size":"33 cm","quantity":1,"unitPrice":10.5,"totalPrice":10.5}],"customerName":"...","customerPhone":"...","mode":"DELIVERY|TAKEAWAY|DINE_IN","address":"...si livraison...","total":...}

IMPORTANT: N'inclus le JSON [COMMANDE_PRÊTE] que quand le client a EXPLICITEMENT confirmé sa commande ET fourni ses coordonnées.`;

async function callGemini(messages: ChatMessage[], userMessage: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Bien compris ! Je suis prêt à prendre les commandes pour Au Paradizzio. Comment puis-je vous aider ?" }] },
    ...messages,
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Gemini API error:", response.status, errorData);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas compris. Pouvez-vous reformuler ?";
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "La clé API Gemini n'est pas configurée" },
        { status: 500 }
      );
    }

    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message requis" },
        { status: 400 }
      );
    }

    const chatHistory: ChatMessage[] = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const botResponse = await callGemini(chatHistory, message);

    // Check if the bot has a completed order
    let orderData = null;
    if (botResponse.includes("[COMMANDE_PRÊTE]")) {
      const jsonMatch = botResponse.match(/\[COMMANDE_PRÊTE\]\s*(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          orderData = JSON.parse(jsonMatch[1]);
        } catch {
          console.error("Failed to parse order JSON from bot response");
        }
      }
    }

    // Clean the response (remove the JSON part for display)
    const cleanResponse = botResponse.replace(/\[COMMANDE_PRÊTE\]\s*\{[\s\S]*\}/, "").trim();

    return NextResponse.json({
      response: cleanResponse,
      orderData,
    });
  } catch (error) {
    console.error("Bot chat error:", error);
    return NextResponse.json(
      { error: "Erreur du service de chat. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

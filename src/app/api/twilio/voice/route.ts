import { NextRequest, NextResponse } from "next/server";
import { col } from "@/lib/firestore";

// Twilio calls this webhook when someone calls your number
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callSid = formData.get("CallSid") as string;
  const from = formData.get("From") as string;

  // Initialize conversation history in Firestore
  if (callSid) {
    await col.storeSettings.doc(`call-${callSid}`).set({
      callSid,
      from,
      history: [],
      createdAt: new Date().toISOString(),
    });
  }

  // Respond with TwiML: greet and start listening
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
    Bonjour et bienvenue chez Au Paradizzio, la pizzeria artisanale d'Entraigues-sur-la-Sorgue !
    Je suis votre assistant de commande. Comment puis-je vous aider ?
  </Say>
  <Gather input="speech" language="fr-FR" speechTimeout="3" timeout="10" action="/api/twilio/gather" method="POST">
    <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
      Vous pouvez me demander le menu, commander une pizza, ou poser une question.
    </Say>
  </Gather>
  <Say language="fr-FR" voice="Google.fr-FR-Wavenet-A">
    Je n'ai pas entendu. N'hésitez pas à rappeler. Au revoir !
  </Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

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
  <Say language="fr-FR" voice="Google.fr-FR-Neural2-A">
    Bonjour, bienvenue Au Paradizzio ! Qu'est-ce qui vous ferait plaisir ?
  </Say>
  <Gather input="speech" language="fr-FR" speechModel="experimental_conversations" enhanced="true" speechTimeout="auto" bargeIn="true" timeout="10" action="/api/twilio/gather" method="POST">
    <Say language="fr-FR" voice="Google.fr-FR-Neural2-A">
      Dites-moi, je vous ecoute.
    </Say>
  </Gather>
  <Say language="fr-FR" voice="Google.fr-FR-Neural2-A">
    Je n'ai pas entendu. N'hesitez pas a rappeler. Au revoir !
  </Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { col } from "@/lib/firestore";

// Twilio calls this when call status changes (completed, failed, etc.)
// Used to clean up call history from Firestore
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callSid = formData.get("CallSid") as string;
  const callStatus = formData.get("CallStatus") as string;

  if (callSid && (callStatus === "completed" || callStatus === "failed" || callStatus === "no-answer")) {
    try {
      await col.storeSettings.doc(`call-${callSid}`).delete();
    } catch {
      // Ignore cleanup errors
    }
  }

  return new NextResponse("<Response/>", {
    headers: { "Content-Type": "text/xml" },
  });
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod, paymentDetails } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    const validMethods = ["card", "cash", "apple_pay", "google_pay"];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          error: `Invalid payment method. Must be one of: ${validMethods.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // In production this would integrate with Stripe, etc.
    // For mock: always return success

    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Simulate a brief processing time concept
    const result = {
      success: true,
      orderId,
      paymentId,
      paymentMethod,
      message:
        paymentMethod === "cash"
          ? "Commande confirmee. Paiement en especes a la reception."
          : "Paiement accepte. Votre commande est en cours de preparation.",
      processedAt: new Date().toISOString(),
    };

    // Log payment details in development (would be sent to payment provider in production)
    if (paymentDetails && process.env.NODE_ENV === "development") {
      console.log("Payment details received (mock):", {
        orderId,
        paymentMethod,
        hasDetails: !!paymentDetails,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

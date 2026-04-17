import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { col } from "@/lib/firestore";
import { addLoyaltyPoints } from "@/lib/db/users";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In development without webhook secret, parse directly
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (orderId) {
      try {
        // Update order payment status
        await col.orders.doc(orderId).update({
          paymentStatus: "PAID",
          status: "PENDING",
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent,
          updatedAt: new Date().toISOString(),
        });

        // Award loyalty points
        if (userId) {
          const total = (session.amount_total ?? 0) / 100;
          const pointsEarned = Math.floor(total);
          await addLoyaltyPoints(userId, pointsEarned);
        }

        console.log(`Payment confirmed for order ${orderId}`);
      } catch (error) {
        console.error("Error updating order after payment:", error);
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await col.orders.doc(orderId).update({
        paymentStatus: "PENDING",
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}

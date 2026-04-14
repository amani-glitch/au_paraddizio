import { NextRequest, NextResponse } from "next/server";

interface PromoResult {
  valid: boolean;
  code: string;
  type: "percentage" | "fixed" | "delivery" | null;
  value: number;
  message: string;
}

const PROMO_CODES: Record<
  string,
  { type: "percentage" | "fixed" | "delivery"; value: number; minOrder?: number; description: string }
> = {
  BIENVENUE: {
    type: "percentage",
    value: 10,
    description: "10% de reduction sur votre commande",
  },
  PIZZA10: {
    type: "fixed",
    value: 10,
    minOrder: 15,
    description: "10 EUR de reduction sur votre commande",
  },
  LIVRAISON: {
    type: "delivery",
    value: 0,
    description: "Livraison gratuite",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          valid: false,
          code: code ?? "",
          type: null,
          value: 0,
          message: "Please provide a promo code",
        } satisfies PromoResult,
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    const promo = PROMO_CODES[normalizedCode];

    if (!promo) {
      return NextResponse.json({
        valid: false,
        code: normalizedCode,
        type: null,
        value: 0,
        message: "Code promo invalide",
      } satisfies PromoResult);
    }

    // Check minimum order amount if applicable
    if (promo.minOrder && typeof orderTotal === "number" && orderTotal < promo.minOrder) {
      return NextResponse.json({
        valid: false,
        code: normalizedCode,
        type: null,
        value: 0,
        message: `Commande minimum de ${promo.minOrder} EUR requise pour ce code`,
      } satisfies PromoResult);
    }

    // Calculate the discount value
    let discountValue = promo.value;
    if (promo.type === "percentage" && typeof orderTotal === "number") {
      discountValue = Math.round(orderTotal * (promo.value / 100) * 100) / 100;
    }

    return NextResponse.json({
      valid: true,
      code: normalizedCode,
      type: promo.type,
      value: discountValue,
      message: promo.description,
    } satisfies PromoResult);
  } catch (error) {
    console.error("POST /api/promo/validate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

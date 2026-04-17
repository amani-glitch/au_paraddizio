import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/db/promos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({
        valid: false,
        code: code ?? "",
        type: null,
        value: 0,
        message: "Veuillez saisir un code promo",
      }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const result = await validatePromoCode(normalizedCode);

    if (!result.valid || !result.promo) {
      return NextResponse.json({
        valid: false,
        code: normalizedCode,
        type: null,
        value: 0,
        message: result.error || "Code promo invalide",
      });
    }

    const promo = result.promo;

    // Check minimum order amount
    if (promo.minOrderAmount && typeof orderTotal === "number" && orderTotal < promo.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        code: normalizedCode,
        type: null,
        value: 0,
        message: `Commande minimum de ${promo.minOrderAmount}€ requise pour ce code`,
      });
    }

    // Calculate discount
    let discountValue = promo.value;
    if (promo.type === "percentage" && typeof orderTotal === "number") {
      discountValue = Math.round(orderTotal * (promo.value / 100) * 100) / 100;
    }

    const typeMap: Record<string, string> = {
      percentage: "percentage",
      fixed: "fixed",
      free_delivery: "delivery",
    };

    return NextResponse.json({
      valid: true,
      code: normalizedCode,
      type: typeMap[promo.type] || promo.type,
      value: discountValue,
      message: promo.type === "percentage"
        ? `${promo.value}% de réduction sur votre commande`
        : promo.type === "fixed"
          ? `${promo.value}€ de réduction sur votre commande`
          : "Livraison gratuite",
    });
  } catch (error) {
    console.error("POST /api/promo/validate error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateOrderNumber } from "@/lib/utils";
import type { OrderMode, OrderStatus } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      items,
      mode,
      address,
      customerInfo,
      paymentMethod,
      promoCode,
      scheduledAt,
      notes,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    if (!mode || !["DELIVERY", "TAKEAWAY", "DINE_IN"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid order mode. Must be DELIVERY, TAKEAWAY, or DINE_IN" },
        { status: 400 }
      );
    }

    if (mode === "DELIVERY" && !address) {
      return NextResponse.json(
        { error: "Delivery address is required for delivery orders" },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return NextResponse.json(
        { error: "Customer name and phone are required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { totalPrice?: number; unitPrice?: number; quantity?: number }) =>
        sum + (item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1)),
      0
    );
    const deliveryFee = mode === "DELIVERY" ? 3 : 0;
    let discount = 0;

    if (promoCode) {
      const code = promoCode.toUpperCase();
      if (code === "BIENVENUE") {
        discount = subtotal * 0.1;
      } else if (code === "PIZZA10") {
        discount = Math.min(10, subtotal);
      } else if (code === "LIVRAISON") {
        discount = deliveryFee;
      }
    }

    const total = subtotal + deliveryFee - discount;

    // Mock response (Prisma DB integration pending)
    const mockOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      status: "PENDING" as OrderStatus,
      mode: mode as OrderMode,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
      address: address ?? null,
      scheduledAt: scheduledAt ?? null,
      estimatedReadyAt: null,
      paymentMethod,
      paymentStatus: "PENDING",
      notes: notes ?? null,
      customerInfo,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(mockOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Mock data (Prisma DB integration pending)
    const sampleOrders = [
      {
        id: "order-mock-1",
        orderNumber: "PAR-20260414-A1B2",
        status: "DELIVERED" as OrderStatus,
        mode: "DELIVERY" as OrderMode,
        items: [
          {
            id: "item-1",
            productName: "Margherita",
            sizeName: "33 cm",
            sizePrice: 10.5,
            quantity: 2,
            supplements: [],
            removedIngredients: [],
            unitPrice: 10.5,
            totalPrice: 21,
          },
        ],
        subtotal: 21,
        deliveryFee: 3,
        discount: 0,
        total: 24,
        paymentMethod: "card",
        paymentStatus: "PAID",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "order-mock-2",
        orderNumber: "PAR-20260413-C3D4",
        status: "PENDING" as OrderStatus,
        mode: "TAKEAWAY" as OrderMode,
        items: [
          {
            id: "item-2",
            productName: "4 Fromages",
            sizeName: "29 cm",
            sizePrice: 10.5,
            quantity: 1,
            supplements: [{ name: "Extra mozzarella", price: 1.5 }],
            removedIngredients: [],
            unitPrice: 12,
            totalPrice: 12,
          },
        ],
        subtotal: 12,
        deliveryFee: 0,
        discount: 0,
        total: 12,
        paymentMethod: "cash",
        paymentStatus: "PENDING",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(sampleOrders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

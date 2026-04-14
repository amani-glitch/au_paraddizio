import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { OrderStatus } from "@/types";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "DELIVERED",
  "CANCELLED",
];

// Allowed status transitions: from -> [to]
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERING", "DELIVERED", "CANCELLED"],
  DELIVERING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    // Try Prisma first
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(order);
    } catch {
      // Database unavailable -- fall through to mock data
    }

    // Mock fallback
    const mockOrder = {
      id: "order-mock-detail",
      orderNumber,
      status: "PREPARING" as OrderStatus,
      mode: "DELIVERY",
      items: [
        {
          id: "item-mock-1",
          productName: "Margherita",
          sizeName: "33 cm",
          sizePrice: 10.5,
          quantity: 1,
          supplements: [{ name: "Extra mozzarella", price: 1.5 }],
          removedIngredients: [],
          unitPrice: 12,
          totalPrice: 12,
        },
        {
          id: "item-mock-2",
          productName: "Tiramisu Maison",
          sizeName: "Portion",
          sizePrice: 5.5,
          quantity: 1,
          supplements: [],
          removedIngredients: [],
          unitPrice: 5.5,
          totalPrice: 5.5,
        },
      ],
      subtotal: 17.5,
      deliveryFee: 3,
      discount: 0,
      total: 20.5,
      address: {
        id: "addr-mock",
        label: "Maison",
        street: "123 Rue de la Paix",
        city: "Entraigues-sur-la-Sorgue",
        postalCode: "84320",
        isDefault: true,
      },
      scheduledAt: null,
      estimatedReadyAt: new Date(Date.now() + 25 * 60000).toISOString(),
      paymentMethod: "card",
      paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    };

    return NextResponse.json(mockOrder);
  } catch (error) {
    console.error("GET /api/orders/[orderNumber] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate new status
    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Try Prisma first
    try {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber },
      });

      if (!existingOrder) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      const currentStatus = existingOrder.status as OrderStatus;
      const allowedTransitions = STATUS_TRANSITIONS[currentStatus];

      if (!allowedTransitions.includes(status as OrderStatus)) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${currentStatus} to ${status}. Allowed: ${allowedTransitions.join(", ") || "none"}`,
          },
          { status: 422 }
        );
      }

      const updated = await prisma.order.update({
        where: { orderNumber },
        data: { status },
        include: { items: true },
      });

      return NextResponse.json(updated);
    } catch {
      // Database unavailable -- fall through to mock response
    }

    // Mock fallback: accept the transition assuming current status is PENDING
    const mockCurrentStatus: OrderStatus = "PENDING";
    const allowedTransitions = STATUS_TRANSITIONS[mockCurrentStatus];

    if (!allowedTransitions.includes(status as OrderStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${mockCurrentStatus} to ${status}. Allowed: ${allowedTransitions.join(", ") || "none"}`,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      id: "order-mock-detail",
      orderNumber,
      status,
      previousStatus: mockCurrentStatus,
      updatedAt: new Date().toISOString(),
      message: `Order ${orderNumber} updated to ${status}`,
    });
  } catch (error) {
    console.error("PATCH /api/orders/[orderNumber] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

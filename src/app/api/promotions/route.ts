import { NextResponse } from "next/server";
import { listPromoCodes } from "@/lib/db/promos";

export async function GET() {
  try {
    const promos = await listPromoCodes();
    // Only return active promos to the public
    const active = promos.filter((p) => p.isActive);
    return NextResponse.json(active);
  } catch (error) {
    console.error("GET /api/promotions error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

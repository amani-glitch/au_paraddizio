import { NextResponse } from "next/server";
import { storeInfo, deliveryZones } from "@/lib/data";
import { isStoreOpen } from "@/lib/utils";

export async function GET() {
  try {
    const isOpen = isStoreOpen(storeInfo.openingHours);

    return NextResponse.json({
      ...storeInfo,
      isOpen,
      deliveryZones,
    });
  } catch (error) {
    console.error("GET /api/store error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/db/store";
import { isStoreOpen } from "@/lib/utils";

export async function GET() {
  try {
    const settings = await getStoreSettings();

    if (!settings) {
      return NextResponse.json(
        { error: "Store settings not found" },
        { status: 404 }
      );
    }

    const { storeInfo, deliveryZones } = settings;
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

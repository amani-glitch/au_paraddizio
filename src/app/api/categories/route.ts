import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { categories as mockCategories } from "@/lib/data";

export async function GET() {
  try {
    // Try Prisma first
    try {
      const dbCategories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: { children: true },
      });

      return NextResponse.json(dbCategories);
    } catch {
      // Database unavailable -- fall through to mock data
    }

    // Mock data fallback
    const sorted = [...mockCategories].sort((a, b) => a.order - b.order);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

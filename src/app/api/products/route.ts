import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/db/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const products = await listProducts({ categorySlug, search });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

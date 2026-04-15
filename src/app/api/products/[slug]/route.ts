import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/db/products";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

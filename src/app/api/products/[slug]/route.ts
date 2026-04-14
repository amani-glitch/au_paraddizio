import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { products as mockProducts, categories as mockCategories } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try Prisma first
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { sizes: true, supplements: true, category: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(product);
    } catch {
      // Database unavailable -- fall through to mock data
    }

    // Mock data fallback
    const product = mockProducts.find(
      (p) => p.slug === slug && p.isActive
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const withCategory = {
      ...product,
      category: mockCategories.find((c) => c.id === product.categoryId),
    };

    return NextResponse.json(withCategory);
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

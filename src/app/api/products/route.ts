import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { products as mockProducts, categories as mockCategories } from "@/lib/data";
import type { Product } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const dietary = searchParams.get("dietary");
    const sort = searchParams.get("sort");

    // Try Prisma first
    try {
      const where: Record<string, unknown> = { isActive: true };

      if (category) {
        where.category = { slug: category };
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
      if (dietary) {
        where.dietary = { has: dietary };
      }

      let orderBy: Record<string, string> = {};
      switch (sort) {
        case "price-asc":
          orderBy = { basePrice: "asc" };
          break;
        case "price-desc":
          orderBy = { basePrice: "desc" };
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "popularity":
        default:
          orderBy = { isBestSeller: "desc" };
          break;
      }

      const dbProducts = await prisma.product.findMany({
        where,
        include: { sizes: true, supplements: true, category: true },
        orderBy,
      });

      return NextResponse.json(dbProducts);
    } catch {
      // Database unavailable -- fall through to mock data
    }

    // Mock data fallback
    let filtered: Product[] = mockProducts.filter((p) => p.isActive);

    if (category) {
      const cat = mockCategories.find((c) => c.slug === category);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      } else {
        filtered = [];
      }
    }

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    if (dietary) {
      filtered = filtered.filter((p) => p.dietary.includes(dietary));
    }

    switch (sort) {
      case "price-asc":
        filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "popularity":
      default:
        filtered.sort(
          (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
        );
        break;
    }

    // Attach category object to each product
    const withCategory = filtered.map((p) => ({
      ...p,
      category: mockCategories.find((c) => c.id === p.categoryId),
    }));

    return NextResponse.json(withCategory);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

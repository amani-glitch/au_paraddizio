import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { createProduct } from "@/lib/db/products";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();
    const id = await createProduct(data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

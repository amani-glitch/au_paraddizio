import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { listPromoCodes, createPromoCode } from "@/lib/db/promos";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const promos = await listPromoCodes();
    return NextResponse.json(promos);
  } catch (error) {
    console.error("GET /api/admin/promotions error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();
    const id = await createPromoCode({
      ...data,
      code: (data.code as string).toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/promotions error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

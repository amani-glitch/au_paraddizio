import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { updatePromoCode, deletePromoCode } from "@/lib/db/promos";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    await updatePromoCode(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/promotions/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    await deletePromoCode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/promotions/[id] error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

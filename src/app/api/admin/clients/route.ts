import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { getClientsWithStats } from "@/lib/db/clients";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const clients = await getClientsWithStats();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/admin/clients error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

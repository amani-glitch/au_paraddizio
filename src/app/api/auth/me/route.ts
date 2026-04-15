import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserById } from "@/lib/db/users";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db/users";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit faire au moins 6 caractères" },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await createUser({
      name,
      email,
      phone,
      password: hashed,
      role: "CUSTOMER",
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

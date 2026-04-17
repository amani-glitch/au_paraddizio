import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db/users";
import { createToken, setSessionCookie, hashPassword } from "@/lib/auth";

interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

async function verifyGoogleToken(credential: string): Promise<GoogleTokenPayload | null> {
  try {
    // Verify the token with Google's tokeninfo endpoint
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!res.ok) return null;

    const payload = await res.json();

    // Verify the audience matches our client ID
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      console.error("Google token audience mismatch");
      return null;
    }

    if (!payload.email_verified || payload.email_verified === "false") {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: true,
      name: payload.name || payload.email.split("@")[0],
      picture: payload.picture,
    };
  } catch (error) {
    console.error("Google token verification error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Token Google manquant" },
        { status: 400 }
      );
    }

    const googleUser = await verifyGoogleToken(credential);
    if (!googleUser) {
      return NextResponse.json(
        { error: "Token Google invalide" },
        { status: 401 }
      );
    }

    // Check if user exists
    let existingUser = await findUserByEmail(googleUser.email);

    if (!existingUser) {
      // Create a new user with a random password (they'll use Google to login)
      const randomPassword = await hashPassword(
        crypto.randomUUID() + Date.now().toString()
      );
      const newUser = await createUser({
        name: googleUser.name,
        email: googleUser.email,
        password: randomPassword,
        role: "CUSTOMER",
      });
      existingUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone ?? undefined,
        role: newUser.role,
        loyaltyPoints: newUser.loyaltyPoints,
        password: randomPassword,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
    }

    const token = await createToken({
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      name: existingUser.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        phone: existingUser.phone,
        role: existingUser.role,
        loyaltyPoints: existingUser.loyaltyPoints,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db/users";
import { createToken, setSessionCookie, hashPassword } from "@/lib/auth";
import { getOrigin } from "@/lib/origin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const origin = getOrigin(request);

  if (error || !code) {
    return NextResponse.redirect(`${origin}/connexion?error=google_cancelled`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/connexion?error=google_not_configured`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("Google token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${origin}/connexion?error=google_token_failed`);
    }

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${origin}/connexion?error=google_userinfo_failed`);
    }

    const googleUser = await userInfoRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return NextResponse.redirect(`${origin}/connexion?error=google_no_email`);
    }

    // Find or create user
    let user = await findUserByEmail(email);
    if (!user) {
      const randomPassword = await hashPassword(crypto.randomUUID());
      const newUser = await createUser({
        name: name || email.split("@")[0],
        email,
        password: randomPassword,
        role: "CUSTOMER",
      });
      user = {
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

    // Create session
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setSessionCookie(token);

    // Redirect to appropriate page
    const redirectTo = user.role === "ADMIN" || user.role === "MANAGER" ? "/admin" : "/compte";
    return NextResponse.redirect(`${origin}${redirectTo}?login=google`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(`${origin}/connexion?error=google_server_error`);
  }
}

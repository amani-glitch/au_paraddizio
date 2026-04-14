import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Try Prisma first
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { addresses: true },
      });

      if (!dbUser) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // In production, compare hashed passwords here
      // For now, we check against the stored password
      if (dbUser.password !== password) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const { password: _pw, ...userWithoutPassword } = dbUser;
      void _pw;

      const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;

      const response = NextResponse.json({
        user: userWithoutPassword,
        token,
      });

      response.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    } catch {
      // Database unavailable -- fall through to mock auth
    }

    // Mock fallback: accept any email with "password123" or any password > 5 chars
    if (password !== "password123" && password.length <= 5) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const mockUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name: email.split("@")[0].replace(/[._-]/g, " "),
      phone: "06 12 34 56 78",
      role: "CUSTOMER",
      loyaltyPoints: 120,
      addresses: [
        {
          id: "addr-default",
          label: "Maison",
          street: "123 Rue de la Paix",
          city: "Entraigues-sur-la-Sorgue",
          postalCode: "84320",
          isDefault: true,
        },
      ],
    };

    const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const response = NextResponse.json({ user: mockUser, token });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

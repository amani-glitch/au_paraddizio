import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validate required fields
    const errors: string[] = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      errors.push("A valid email is required");
    }

    if (!phone || typeof phone !== "string" || phone.replace(/\s/g, "").length < 8) {
      errors.push("A valid phone number is required");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Try Prisma first
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      // In production, hash the password before storing
      const dbUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          phone,
          password, // TODO: hash in production
          role: "CUSTOMER",
          loyaltyPoints: 0,
        },
        include: { addresses: true },
      });

      const { password: _pw, ...userWithoutPassword } = dbUser;
      void _pw;

      const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;

      const response = NextResponse.json(
        { user: userWithoutPassword, token },
        { status: 201 }
      );

      response.cookies.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    } catch {
      // Database unavailable -- fall through to mock registration
    }

    // Mock fallback
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name: name.trim(),
      phone,
      role: "CUSTOMER",
      loyaltyPoints: 0,
      addresses: [],
    };

    const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const response = NextResponse.json(
      { user: mockUser, token },
      { status: 201 }
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

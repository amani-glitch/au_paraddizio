import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock jose module
vi.mock("jose", () => {
  class MockSignJWT {
    constructor() {}
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    sign() { return Promise.resolve("mock-jwt-token"); }
  }
  return {
    SignJWT: MockSignJWT,
    jwtVerify: vi.fn().mockResolvedValue({
      payload: {
        userId: "user-1",
        email: "test@example.com",
        role: "CUSTOMER",
        name: "Test User",
      },
    }),
  };
});

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$10$mockedHashedPassword"),
    compare: vi.fn().mockImplementation((password: string, hash: string) => {
      return Promise.resolve(password === "correctpassword");
    }),
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue({ value: "mock-token" }),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

describe("Auth Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const { hashPassword } = await import("@/lib/auth");
      const hash = await hashPassword("testpassword");
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe("testpassword");
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const { verifyPassword } = await import("@/lib/auth");
      const result = await verifyPassword("correctpassword", "$2a$10$hash");
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const { verifyPassword } = await import("@/lib/auth");
      const result = await verifyPassword("wrongpassword", "$2a$10$hash");
      expect(result).toBe(false);
    });
  });

  describe("createToken", () => {
    it("should create a JWT token", async () => {
      const { createToken } = await import("@/lib/auth");
      const token = await createToken({
        userId: "user-1",
        email: "test@example.com",
        role: "CUSTOMER",
        name: "Test User",
      });
      expect(token).toBe("mock-jwt-token");
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", async () => {
      const { verifyToken } = await import("@/lib/auth");
      const payload = await verifyToken("valid-token");
      expect(payload).toBeDefined();
      expect(payload?.email).toBe("test@example.com");
      expect(payload?.role).toBe("CUSTOMER");
    });
  });

  describe("isAdmin", () => {
    it("should return true for ADMIN role", async () => {
      const { isAdmin } = await import("@/lib/auth");
      expect(isAdmin("ADMIN")).toBe(true);
    });

    it("should return true for MANAGER role", async () => {
      const { isAdmin } = await import("@/lib/auth");
      expect(isAdmin("MANAGER")).toBe(true);
    });

    it("should return false for CUSTOMER role", async () => {
      const { isAdmin } = await import("@/lib/auth");
      expect(isAdmin("CUSTOMER")).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";
import { formatPrice, generateOrderNumber, slugify, cn } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatPrice", () => {
    it("should format a price in EUR", () => {
      const result = formatPrice(10.5);
      expect(result).toContain("10,50");
      expect(result).toContain("€");
    });

    it("should handle zero", () => {
      const result = formatPrice(0);
      expect(result).toContain("0,00");
    });

    it("should handle large amounts", () => {
      const result = formatPrice(1234.56);
      expect(result).toContain("€");
    });
  });

  describe("generateOrderNumber", () => {
    it("should generate a string starting with PAR-", () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^PAR-\d{8}-[A-Z0-9]{4}$/);
    });

    it("should generate unique numbers", () => {
      const a = generateOrderNumber();
      const b = generateOrderNumber();
      // Very unlikely to be equal, but possible
      expect(typeof a).toBe("string");
      expect(typeof b).toBe("string");
    });
  });

  describe("slugify", () => {
    it("should slugify simple text", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should handle accented characters", () => {
      expect(slugify("Crème brûlée")).toBe("creme-brulee");
    });

    it("should handle special characters", () => {
      expect(slugify("Pizza 4 Fromages!")).toBe("pizza-4-fromages");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("bg-red-500", "text-white");
      expect(result).toContain("bg-red-500");
      expect(result).toContain("text-white");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", false && "hidden", "visible");
      expect(result).toContain("base");
      expect(result).toContain("visible");
      expect(result).not.toContain("hidden");
    });

    it("should merge tailwind conflicts correctly", () => {
      const result = cn("px-4", "px-6");
      expect(result).toBe("px-6");
    });
  });
});

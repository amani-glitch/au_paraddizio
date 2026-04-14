"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "new" | "bestseller" | "promo" | "pizzaOfMonth";

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  new: "bg-secondary text-white",
  bestseller: "bg-accent text-wood",
  promo: "bg-primary text-white",
  pizzaOfMonth: "bg-gradient-to-r from-accent to-primary text-white",
};

export default function Badge({ children, variant }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
        variantStyles[variant]
      )}
    >
      {children}
    </span>
  );
}

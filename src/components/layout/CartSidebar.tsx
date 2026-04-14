"use client";

import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function CartSidebar() {
  const { isCartOpen, toggleCart } = useUIStore();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    total,
    setPromoCode,
  } = useCartStore();
  const [promoInput, setPromoInput] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      setPromoCode(promoInput.trim().toUpperCase());
      setPromoInput("");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-wood">
              Votre panier
            </h2>
          </div>
          <button
            onClick={toggleCart}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fermer le panier"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
              <p className="mb-2 font-heading text-lg font-semibold text-gray-500">
                Votre panier est vide
              </p>
              <p className="mb-6 text-sm text-gray-400">
                Ajoutez de délicieuses pizzas pour commencer !
              </p>
              <button
                onClick={toggleCart}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Voir le menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🍕
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-wood">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.size.name}
                          {item.supplements.length > 0 && (
                            <span>
                              {" + "}
                              {item.supplements.map((s) => s.name).join(", ")}
                            </span>
                          )}
                        </p>
                        {item.removedIngredients.length > 0 && (
                          <p className="text-xs text-red-400">
                            Sans : {item.removedIngredients.join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-gray-400 transition-colors hover:text-red-500"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 text-gray-500 transition-colors hover:text-primary"
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 text-gray-500 transition-colors hover:text-primary"
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-bold text-primary">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-gray-400 transition-colors hover:text-red-500"
              >
                Vider le panier
              </button>
            </div>
          )}
        </div>

        {/* Footer with totals */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <form onSubmit={handleApplyPromo} className="mb-4 flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Code promo"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-light"
              >
                OK
              </button>
            </form>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>
                  {deliveryFee() === 0
                    ? "Gratuite"
                    : formatPrice(deliveryFee())}
                </span>
              </div>
              {discount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{formatPrice(discount())}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-wood">
                <span>Total</span>
                <span>{formatPrice(total())}</span>
              </div>
            </div>

            <Link
              href="/commander"
              onClick={toggleCart}
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-accent py-3.5 text-base font-bold text-wood transition-colors hover:bg-accent-light"
            >
              Commander - {formatPrice(total())}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/stores/cart-store";

const mockProduct = {
  id: "pizza-margherita",
  name: "Margherita",
  slug: "margherita",
  description: "Sauce tomate, mozzarella, basilic frais",
  image: "/images/pizzas/margherita.jpg",
  images: [],
  categoryId: "cat-pizzas",
  basePrice: 8.5,
  isActive: true,
  isNew: false,
  isBestSeller: true,
  isPromo: false,
  isPizzaOfMonth: false,
  allergens: ["gluten", "lait"],
  dietary: ["vegetarian"],
  sizes: [
    { id: "size-29", name: "29 cm", price: 8.5 },
    { id: "size-33", name: "33 cm", price: 10.5 },
  ],
  supplements: [],
};

const mockSize = { id: "size-33", name: "33 cm", price: 10.5 };

describe("Cart Store", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("should start with empty cart", () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.itemCount()).toBe(0);
  });

  it("should add an item to cart", () => {
    const { addItem } = useCartStore.getState();
    addItem({
      product: mockProduct,
      size: mockSize,
      quantity: 1,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.name).toBe("Margherita");
    expect(state.items[0].size.name).toBe("33 cm");
    expect(state.items[0].quantity).toBe(1);
  });

  it("should calculate correct subtotal", () => {
    const { addItem } = useCartStore.getState();
    addItem({
      product: mockProduct,
      size: mockSize,
      quantity: 2,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });

    const state = useCartStore.getState();
    expect(state.subtotal()).toBe(21); // 10.5 * 2
  });

  it("should remove an item", () => {
    const { addItem } = useCartStore.getState();
    addItem({
      product: mockProduct,
      size: mockSize,
      quantity: 1,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);

    state.removeItem(state.items[0].id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("should update quantity", () => {
    const { addItem } = useCartStore.getState();
    addItem({
      product: mockProduct,
      size: mockSize,
      quantity: 1,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });

    const state = useCartStore.getState();
    const itemId = state.items[0].id;
    state.updateQuantity(itemId, 3);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("should clear cart", () => {
    const { addItem } = useCartStore.getState();
    addItem({
      product: mockProduct,
      size: mockSize,
      quantity: 1,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("should count items correctly with multiple products", () => {
    const { addItem } = useCartStore.getState();
    addItem({
      product: mockProduct,
      size: mockSize,
      quantity: 2,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });
    addItem({
      product: { ...mockProduct, id: "pizza-4fromages", name: "4 Fromages" },
      size: { id: "size-33-4f", name: "33 cm", price: 12.5 },
      quantity: 1,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });

    expect(useCartStore.getState().itemCount()).toBe(3);
  });
});

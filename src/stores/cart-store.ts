import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, OrderMode, Address, Product, ProductSize, ProductSupplement } from '@/types';

interface CartState {
  items: CartItem[];
  orderMode: OrderMode;
  promoCode: string | null;
  deliveryAddress: Address | null;
}

interface CartActions {
  addItem: (params: {
    product: Product;
    size: ProductSize;
    quantity: number;
    supplements?: ProductSupplement[];
    removedIngredients?: string[];
    halfHalf?: { product: Product; size: ProductSize; supplements: ProductSupplement[] };
    specialInstructions?: string;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemSupplements: (id: string, supplements: ProductSupplement[]) => void;
  clearCart: () => void;
  setOrderMode: (mode: OrderMode) => void;
  setPromoCode: (code: string | null) => void;
  setDeliveryAddress: (address: Address | null) => void;
}

interface CartGetters {
  itemCount: () => number;
  subtotal: () => number;
  deliveryFee: () => number;
  discount: () => number;
  total: () => number;
}

type CartStore = CartState & CartActions & CartGetters;

function calculateUnitPrice(size: ProductSize, supplements: ProductSupplement[]): number {
  return size.price + supplements.reduce((sum, s) => sum + s.price, 0);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      orderMode: 'TAKEAWAY',
      promoCode: null,
      deliveryAddress: null,

      // Actions
      addItem: ({ product, size, quantity, supplements = [], removedIngredients = [], halfHalf, specialInstructions = '' }) => {
        const unitPrice = calculateUnitPrice(size, supplements);
        const totalPrice = unitPrice * quantity;
        const id = crypto.randomUUID();

        const newItem: CartItem = {
          id,
          product,
          size,
          quantity,
          supplements,
          removedIngredients,
          halfHalf,
          specialInstructions,
          unitPrice,
          totalPrice,
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
              : item
          ),
        }));
      },

      updateItemSupplements: (id, supplements) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const unitPrice = calculateUnitPrice(item.size, supplements);
            return {
              ...item,
              supplements,
              unitPrice,
              totalPrice: unitPrice * item.quantity,
            };
          }),
        }));
      },

      clearCart: () => {
        set({ items: [], promoCode: null });
      },

      setOrderMode: (mode) => {
        set({ orderMode: mode });
      },

      setPromoCode: (code) => {
        set({ promoCode: code });
      },

      setDeliveryAddress: (address) => {
        set({ deliveryAddress: address });
      },

      // Computed getters
      itemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      deliveryFee: () => {
        const state = get();
        if (state.orderMode !== 'DELIVERY') return 0;
        // Default delivery fee; can be refined with delivery zone logic
        return 3.5;
      },

      discount: () => {
        // Placeholder: discount logic based on promoCode can be implemented here
        return 0;
      },

      total: () => {
        const state = get();
        return state.subtotal() + state.deliveryFee() - state.discount();
      },
    }),
    {
      name: 'paradizzio-cart',
    }
  )
);

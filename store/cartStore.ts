import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/CartItem";
import { mergeCart } from "@/lib/api/cartApi";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant: string) => void;
  updateQuantity: (productId: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  mergeWithServer: () => Promise<void>;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ✅ Add item or increase quantity if it already exists
      addItem: (item: CartItem) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variant === item.variant
        );

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId && i.variant === item.variant
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      // ✅ Remove item by product and variant
      removeItem: (productId, variant) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variant === variant)
          ),
        });
      },

      // ✅ Update quantity for a specific product/variant
      updateQuantity: (productId, variant, quantity) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variant === variant
              ? { ...i, quantity }
              : i
          ),
        });
      },

      // ✅ Clear all items in the cart
      clearCart: () => {
        set({ items: [] });
      },

      // ✅ Merge guest cart with server on login
      mergeWithServer: async () => {
        const guestItems = get().items;
        if (guestItems.length > 0) {
          await mergeCart(guestItems);
          set({ items: [] });
        }
      },

      // ✅ Get the current cart subtotal
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage", // localStorage key
      version: 1,
    }
  )
);

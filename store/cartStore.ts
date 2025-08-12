import { create } from "zustand";
import { persist } from "zustand/middleware";
import isEqual from "lodash.isequal";
import axios from "axios";
import type { CartItem } from "@/types/CartItem";

interface CartState {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant: CartItem["variant"]) => void;
  updateQuantity: (productId: string, variant: CartItem["variant"], quantity: number) => void;
  clearCart: () => void;

  mergeWithServer: () => Promise<void>;
  getSubtotal: () => number;
}

// Central validation for cart items
const isValidCartItem = (item: CartItem): boolean => {
  return Boolean(
    item.productId &&
      typeof item.productId === "string" &&
      typeof item.name === "string" &&
      typeof item.price === "number" &&
      typeof item.discountPrice === "number" &&
      typeof item.image === "string" &&
      item.variant?.brand &&
      typeof item.variant.brand === "string" &&
      item.variant?.size &&
      typeof item.variant.size === "string" &&
      typeof item.quantity === "number" &&
      item.quantity > 0
  );
};

// Async memoized user ID getter to support future async auth (mock async example)
let cachedUserId: string = "guest"; // ✅ default to "guest"

export async function getUserIdForCart(): Promise<string> {
  if (cachedUserId !== "guest") return cachedUserId;

  if (typeof window === "undefined") return "guest"; // server-side fallback

  try {
    const userJson = localStorage.getItem("auth-user") || "null";
    const user = JSON.parse(userJson);
    cachedUserId = user?.id ?? "guest"; // ✅ always a string
    return cachedUserId;
  } catch {
    return "guest";
  }
}


// Debounce helper to limit how often localStorage is written to
function debounce<Func extends (...args: unknown[]) => void>(fn: Func, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;
  return (...args: Parameters<Func>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!isValidCartItem(item)) {
          console.warn("❌ Invalid cart item skipped:", item);
          return;
        }

        const existingIndex = get().items.findIndex((i) =>
          i.productId === item.productId && isEqual(i.variant, item.variant)
        );

        if (existingIndex !== -1) {
          // Increase quantity for existing item
          set({
            items: get().items.map((i, idx) =>
              idx === existingIndex
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (productId, variant) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && isEqual(i.variant, variant))
          ),
        });
      },

      updateQuantity: (productId, variant, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.productId === productId && isEqual(i.variant, variant)
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      mergeWithServer: async () => {
        const localItems = get().items;
        const validItems = localItems.filter(isValidCartItem);

        if (validItems.length === 0) {
          console.warn("🚫 No valid cart items to merge.");
          return;
        }

        const skipped = localItems.filter((i) => !isValidCartItem(i));
        if (skipped.length > 0) {
          console.warn("❌ Skipped invalid cart items during merge:", skipped);
        }

        try {
          await axios.post("/api/cart/merge", validItems);
          set({ items: [] });
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("❌ Merge failed:", error.response?.data || error.message);
          } else {
            console.error("❌ Unexpected error during cart merge:", error);
          }
        }
      },

      getSubtotal: () => {
        // Use reduce efficiently, avoid re-calculating on each call if needed (memoization possible)
        return get().items.reduce((sum, item) => {
          const price = item.discountPrice > 0 ? item.discountPrice : item.price;
          return sum + price * item.quantity;
        }, 0);
      },
    }),

    {
      name: "cart-storage",
      version: 1,
      partialize: (state) => ({ items: state.items }),

      storage: {
        getItem: async (name) => {
          const userId = await getUserIdForCart();
          const value = localStorage.getItem(`${name}-${userId}`);
          return value ? JSON.parse(value) : null;
        },

        setItem: debounce(async (name, value) => {
          const userId = await getUserIdForCart();
          localStorage.setItem(`${name}-${userId}`, JSON.stringify(value));
        }, 250),

        removeItem: async (name) => {
          const userId = await getUserIdForCart();
          localStorage.removeItem(`${name}-${userId}`);
        },
      },
    }
  )
);

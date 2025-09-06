// store/wishlistStore.ts
"use client";

import { create } from "zustand";
import type { WishlistItem } from "@/types/wishlist";
import type { Product } from "@/types/product";

// 🔑 LocalStorage key
const LOCAL_KEY = "wishlist_guest_v1";

// --- API Layer (replace with real calls) ---
// --- API Layer (corrected) ---
const api = {
  fetch: async (): Promise<WishlistItem[]> => {
    const res = await fetch("/api/wishlist", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch wishlist");
    return res.json();
  },

  add: async (productId: string) => {
    const res = await fetch(`/api/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error("Failed to add to wishlist");
    return res.json();
  },

  remove: async (productId: string) => {
    const res = await fetch(`/api/wishlist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error("Failed to remove from wishlist");
    return res.json();
  },

  clear: async () => {
    const res = await fetch(`/api/wishlist`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to clear wishlist");
    return res.json();
  },
};


// --- Store Types ---
interface WishlistState {
  items: WishlistItem[];
  isAuthenticated: boolean; // auto switch guest vs logged in
}

interface WishlistActions {
  setItems: (items: WishlistItem[]) => void;
  setAuthenticated: (value: boolean) => void;
  load: () => Promise<void>;
  add: (product: Product) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

export type WishlistStore = WishlistState & WishlistActions;

// --- Helpers ---
function toSnapshot(product: Product) {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    discountPrice: product.discountPrice ?? null,
  };
}

function saveGuest(items: WishlistItem[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Could not save guest wishlist:", err);
  }
}

function loadGuest(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// --- Store Implementation ---
const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isAuthenticated: false, // default guest

  // --- Mutators ---
  setItems: (items) => set({ items }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),

  // --- Load ---
  load: async () => {
    if (typeof window === "undefined") return;

    try {
      const items = get().isAuthenticated ? await api.fetch() : loadGuest();
      set({ items });
    } catch (err) {
      console.warn("Wishlist load failed:", err);
      set({ items: [] });
    }
  },

  // --- Add ---
  add: async (product: Product) => {
    const now = new Date().toISOString();
    const snapshot = toSnapshot(product);

    const existing = get().items.filter((i) => i.productId !== product.id);
    const next: WishlistItem[] = [
      { productId: product.id, productSnapshot: snapshot, addedAt: now },
      ...existing,
    ];

    try {
      if (get().isAuthenticated) {
        await api.add(product.id);
      } else {
        saveGuest(next);
      }
      set({ items: next });
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    }
  },

  // --- Remove ---
  remove: async (productId: string) => {
    const next = get().items.filter((i) => i.productId !== productId);

    try {
      if (get().isAuthenticated) {
        await api.remove(productId);
      } else {
        saveGuest(next);
      }
      set({ items: next });
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  },

  // --- Clear ---
  clear: async () => {
    try {
      if (get().isAuthenticated) {
        await api.clear();
      } else {
        localStorage.removeItem(LOCAL_KEY);
      }
      set({ items: [] });
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
    }
  },
}));

// --- Cross-tab Sync (guest mode only) ---
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === LOCAL_KEY) {
      try {
        const parsed: WishlistItem[] = event.newValue
          ? JSON.parse(event.newValue)
          : [];
        useWishlistStore.getState().setItems(parsed);
      } catch (err) {
        console.warn("Failed cross-tab wishlist sync:", err);
      }
    }
  });
}

export default useWishlistStore;

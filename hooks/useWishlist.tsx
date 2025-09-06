// hooks/useWishlist.ts
"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import useWishlistStore from "@/store/wishlistStore";
import type { Product } from "@/types/product";
import type { WishlistItem } from "@/types/wishlist";

const LOCAL_GUEST_KEY = "wishlist_guest_v1";

export default function useWishlist() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const items = useWishlistStore((s) => s.items);
  const load = useWishlistStore((s) => s.load);
  const addLocal = useWishlistStore((s) => s.add);
  const removeLocal = useWishlistStore((s) => s.remove);
  const setItems = useWishlistStore((s) => s.setItems);

  // ---------------- Auto load on mount ----------------
  useEffect(() => {
    load();
  }, [load]);

  // ---------------- Sync guest wishlist when user logs in ----------------
  useEffect(() => {
    if (!userId) return;

    const syncGuestWishlist = async () => {
      try {
        const raw = localStorage.getItem(LOCAL_GUEST_KEY);
        const guestItems: WishlistItem[] = raw ? JSON.parse(raw) : [];

        if (guestItems.length > 0) {
          await fetch("/api/wishlist", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guestItems }),
            credentials: "include",
          });

          localStorage.removeItem(LOCAL_GUEST_KEY);
        }

        const res = await fetch("/api/wishlist", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load wishlist");
        const json = (await res.json()) as { items: WishlistItem[] };
        setItems(json.items ?? []);
      } catch (err) {
        console.error("Wishlist sync error:", err);
      }
    };

    syncGuestWishlist();
  }, [userId, setItems]);

  // ---------------- Add product ----------------
  const add = useCallback(
    async (product: Product) => {
      addLocal(product); // Optimistic update

      if (!userId) {
        toast.success("Added to wishlist");
        return;
      }

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Server error");

        const listRes = await fetch("/api/wishlist", { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to refresh wishlist");
        const listJson = await listRes.json();
        setItems(listJson.items ?? []);

        toast.success("Added to wishlist");
      } catch (err) {
        console.error("Add wishlist failed:", err);
        removeLocal(product.id); // rollback
        toast.error("Could not add to wishlist");
      }
    },
    [userId, addLocal, removeLocal, setItems]
  );

  // ---------------- Remove product ----------------
  const remove = useCallback(
    async (productId: string) => {
      const prevItems = [...items];
      removeLocal(productId); // Optimistic update

      if (!userId) {
        toast.success("Removed from wishlist");
        return;
      }

      try {
        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Server error");

        const listRes = await fetch("/api/wishlist", { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to refresh wishlist");
        const listJson = await listRes.json();
        setItems(listJson.items ?? []);

        toast.success("Removed from wishlist");
      } catch (err) {
        console.error("Remove wishlist failed:", err);
        setItems(prevItems); // rollback
        toast.error("Could not remove from wishlist");
      }
    },
    [userId, items, removeLocal, setItems]
  );

  // ---------------- Toggle product ----------------
  const toggle = useCallback(
    (product: Product) => {
      const exists = items.some((i) => i.productId === product.id);
      if (exists) remove(product.id);
      else add(product);
    },
    [items, add, remove]
  );

  // ---------------- Check if product is wishlisted ----------------
  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  return { items, add, remove, toggle, isWishlisted };
}

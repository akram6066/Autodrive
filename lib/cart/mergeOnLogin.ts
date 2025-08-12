// lib/cart/mergeOnLogin.ts
"use client";

import { useCartStore } from "@/store/cartStore";
import { mergeCart } from "@/lib/api/cartApi";
import type { CartItem } from "@/types/CartItem";

let hasMerged = false;

export async function handleCartMerge() {
  if (hasMerged) return;

  const guestCart = useCartStore.getState().items ?? [];

  const validItems: CartItem[] = [];
  const skippedItems: unknown[] = [];

  for (const item of guestCart) {
    if (
      item &&
      typeof item.productId === "string" &&
      typeof item.name === "string" &&
      typeof item.price === "number" &&
      typeof item.discountPrice === "number" &&
      typeof item.image === "string" &&
      typeof item.quantity === "number" &&
      item.variant &&
      typeof item.variant.brand === "string" &&
      typeof item.variant.size === "string"
    ) {
      validItems.push(item as CartItem);
    } else {
      skippedItems.push(item);
    }
  }

  if (process.env.NODE_ENV === "development" && skippedItems.length > 0) {
    console.warn("❌ Skipped invalid cart items:", skippedItems);
  }

  try {
    if (validItems.length > 0) {
      await mergeCart(validItems);
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Guest cart merged to server.");
      }
    }
  } catch (err) {
    console.error("❌ Merge failed:", err);
    return;
  }

  useCartStore.getState().clearCart();

  // ✅ Restore user cart
  try {
    const user = JSON.parse(localStorage.getItem("auth-user") || "null");
    const userId = user?.id;

    if (userId) {
      const key = `cart-storage-${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored)?.state?.items ?? [];
        useCartStore.setState({ items: parsed });
        if (process.env.NODE_ENV === "development") {
          console.log("🛒 Restored logged-in cart from:", key);
        }
      }
    }
  } catch (err) {
    console.error("❌ Failed to restore user cart:", err);
  }

  hasMerged = true;
}

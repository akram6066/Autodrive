import axios from "axios";
import type { CartItem } from "@/types/CartItem";

// Get full server cart (for logged-in users)
export async function getServerCart(): Promise<CartItem[]> {
  const res = await axios.get("/api/cart");
  return res.data;
}

// Add item to server cart
export async function addToServerCart(item: CartItem) {
  await axios.post("/api/cart", {
    productId: item.productId,
    variant: item.variant,
    quantity: item.quantity,
  });
}

// Update quantity server cart
export async function updateServerCartItem(itemId: string, quantity: number) {
  await axios.put(`/api/cart/${itemId}`, { quantity });
}

// Delete item server cart
export async function deleteServerCartItem(itemId: string) {
  await axios.delete(`/api/cart/${itemId}`);
}

// Merge guest cart into server
export async function mergeCart(items: CartItem[]) {
  await axios.post("/api/cart/merge", { items });
}

import { useCartStore } from "@/store/cartStore";
import { mergeCart } from "@/lib/api/cartApi";

let hasMerged = false;  // ✅ To prevent multiple merges in same session

export async function handleCartMerge() {
  if (hasMerged) return;  // prevent repeated merges

  const guestCart = useCartStore.getState().items;

  if (guestCart.length > 0) {
    try {
      await mergeCart(guestCart);
      useCartStore.getState().clearCart();  // Clear guest cart after merge
      console.log("✅ Guest cart successfully merged to server cart.");
    } catch (err) {
      console.error("❌ Failed to merge cart:", err);
    }
  }

  hasMerged = true;
}

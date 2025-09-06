// types/wishlist.ts
import  "@/types/product";

export interface WishlistProductSnapshot {
  id: string;
  name: string;
  image: string;
  discountPrice?: number | null;
}

export interface WishlistItem {
  productId: string;
  productSnapshot?: WishlistProductSnapshot;
  addedAt: string; // ISO timestamp
}

// server response shape
export interface WishlistApiResponse {
  total: number;
  items: WishlistItem[];
}

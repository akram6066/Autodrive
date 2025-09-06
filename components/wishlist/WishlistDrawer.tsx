// components/wishlist/WishlistDrawer.tsx
"use client";
import React from "react";
import useWishlist from "@/hooks/useWishlist";
import Link from "next/link";
import Image from "next/image";

export default function WishlistDrawer() {
  const { items, remove } = useWishlist();

  return (
    <div className="w-full max-w-md p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Your Wishlist ({items.length})</h3>
      <div className="space-y-3">
        {items.length === 0 && <div className="text-sm text-muted-foreground">Your wishlist is empty</div>}
        {items.map((it) => (
          <div key={it.productId} className="flex items-center gap-3">
            <Link href={`/product/${it.productSnapshot?.id ?? it.productId}`} className="flex items-center gap-3 grow">
              <div className="relative w-14 h-14 rounded-md overflow-hidden">
                <Image
                  src={it.productSnapshot?.image ?? "/images/placeholder.png"}
                  alt={it.productSnapshot?.name ?? "Product"}
                  fill
                  sizes="56px"
                />
              </div>
              <div className="grow">
                <div className="font-medium text-sm">{it.productSnapshot?.name ?? "Product"}</div>
                <div className="text-xs text-gray-500">{it.productSnapshot?.discountPrice ? `Ksh ${it.productSnapshot.discountPrice}` : ""}</div>
              </div>
            </Link>
            <button onClick={() => remove(it.productId)} className="text-sm px-2 py-1 rounded bg-red-50 text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/wishlist" className="block w-full text-center py-2 rounded bg-black text-white">Open wishlist</Link>
      </div>
    </div>
  );
}

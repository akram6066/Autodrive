// app/wishlist/page.tsx
"use client";
import React from "react";
import useWishlist from "@/hooks/useWishlist";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div key={it.productId} className="border rounded-md p-4 flex gap-4 items-center">
            <div className="w-28 h-28 relative rounded-md overflow-hidden">
              <Image src={it.productSnapshot?.image ?? "/images/placeholder.png"} alt={it.productSnapshot?.name ?? ""} fill sizes="112px" />
            </div>
            <div className="flex-1">
              <Link href={`/product/${it.productSnapshot?.id ?? it.productId}`} className="text-lg font-medium">
                {it.productSnapshot?.name ?? "Product"}
              </Link>
              <div className="text-sm text-gray-500 mt-1">
                {it.productSnapshot?.discountPrice ? `Ksh ${it.productSnapshot.discountPrice}` : ""}
              </div>
            </div>
            <div>
              <button onClick={() => remove(it.productId)} className="px-3 py-2 rounded border text-sm">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

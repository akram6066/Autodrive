"use client";

import { useCartStore } from "@/store/cartStore";

export default function CartBadge() {
  const items = useCartStore((state) => state.items);
  return (
    <span className="relative inline-block">
      🛒
      {items.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {items.length}
        </span>
      )}
    </span>
  );
}

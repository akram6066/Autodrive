"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export default function MiniCart() {
  const items = useCartStore((state) => state.items);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Only render badge after client-side hydration
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart size={28} className="text-gray-700 hover:text-primary transition" />

      {hydrated && totalQuantity > 0 && (
        <span
          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md"
        >
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}

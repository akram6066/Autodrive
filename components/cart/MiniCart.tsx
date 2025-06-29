"use client";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function MiniCart() {
  const items = useCartStore((state) => state.items);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="relative">
      <Link href="/cart" className="relative">
        <ShoppingCart size={28} />
        {totalQuantity > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {totalQuantity}
          </div>
        )}
      </Link>
    </div>
  );
}

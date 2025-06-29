// CartItemComponent.tsx
"use client";

import Image from "next/image";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/price";
import type { CartItem } from "@/types/CartItem"; // ✅ use `type`

interface Props {
  item: CartItem;
}

export default function CartItemComponent({ item }: Props) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleRemove = () => {
    removeItem(item.productId, item.variant);
    toast.success("Removed from cart");
  };

  const total = (item.discountPrice ?? item.price) * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center border-b pb-4">
      <Image src={item.image} alt={item.name} width={100} height={100} className="rounded-lg object-cover" />
      <div className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-lg">{item.name}</p>
            <p className="text-sm text-gray-500">Size: {item.variant}</p>
          </div>
          <div className="text-lg font-bold mt-2 sm:mt-0">
            {formatPrice(total)}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button
            aria-label="Decrease quantity"
            onClick={() => updateQuantity(item.productId, item.variant, Math.max(1, item.quantity - 1))}
            className="bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded text-lg font-bold"
          >-</button>
          <span className="font-semibold">{item.quantity}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
            className="bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded text-lg font-bold"
          >+</button>
          <button
            aria-label="Remove item"
            onClick={handleRemove}
            className="ml-auto sm:ml-0 text-red-500 hover:text-red-700"
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

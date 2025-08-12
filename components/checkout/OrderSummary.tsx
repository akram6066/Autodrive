"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/price";
import { CartItem } from "@/types/CartItem";

export default function OrderSummary() {
  const { items } = useCartStore() as { items: CartItem[] };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Original subtotal (without discount)
  const originalSubtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Subtotal after applying discounts
  const discountedSubtotal = items.reduce((acc, item) => {
    const actualPrice =
      item.discountPrice > 0 ? item.discountPrice : item.price;
    return acc + actualPrice * item.quantity;
  }, 0);

  const discount = originalSubtotal - discountedSubtotal;
  const total = discountedSubtotal;

  return (
    <div className="w-full bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No items in your cart.
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {items.map((item, index) => {
              const actualPrice =
                item.discountPrice > 0 ? item.discountPrice : item.price;
              const { brand, size } = item.variant;

              return (
                <div
                  key={`${item.productId}-${brand}-${size}-${index}`}
                  className="flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Brand: {brand}, Size: {size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-semibold text-gray-800 dark:text-white">
                    {formatPrice(actualPrice * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(originalSubtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-4">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

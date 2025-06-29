"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/price";

export default function OrderSummary() {
  const { items, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    setMounted(true);
    setSubtotal(getSubtotal());
  }, [getSubtotal, items]);

  if (!mounted) return null;

  // 🔢 Discount calculation (based on price difference)
  const discount = items.reduce((acc, item) => {
    const priceDiff = item.price - item.discountPrice;
    if (priceDiff > 0) {
      return acc + priceDiff * item.quantity;
    }
    return acc;
  }, 0);

  const total = subtotal - discount;

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
            {items.map((item) => {
              const price = item.discountPrice > 0 ? item.discountPrice : item.price;
              return (
                <div key={`${item.productId}-${item.variant}`} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.variant} &nbsp;•&nbsp; Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-semibold text-gray-800 dark:text-white">
                    {formatPrice(price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
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

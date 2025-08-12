"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/price";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CartSummary() {
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const { data: session } = useSession();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  const originalTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountTotal = Math.max(0, originalTotal - subtotal);

  const handleCheckout = () => {
    if (subtotal === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!session) {
      setShowLoginPrompt(true);
      return;
    }

    router.push("/checkout");
  };

  const confirmLoginRedirect = () => {
    setShowLoginPrompt(false);
    // Add redirect URL after login to go back to /checkout
    router.push("/login?callbackUrl=/checkout");
  };

  return (
    <aside className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Order Summary</h2>

      <div className="overflow-x-auto sm:overflow-x-visible">
        <div className="flex sm:grid sm:grid-cols-2 gap-4 pb-4 min-w-full">
          {items.map((item, index) => {
            const hasDiscount = item.discountPrice && item.discountPrice < item.price;

            return (
              <div
                key={index}
                className="min-w-[180px] flex-shrink-0 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm"
              >
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Qty: {item.quantity}
                </p>

                {hasDiscount ? (
                  <div className="flex flex-col text-right">
                    <span className="text-gray-400 line-through text-xs">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <span className="text-green-600 font-semibold text-sm">
                      {formatPrice(item.discountPrice * item.quantity)}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mt-4">
        <div className="flex justify-between">
          <span>Subtotal (before discount)</span>
          <span>{formatPrice(originalTotal)}</span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount</span>
            <span>-{formatPrice(discountTotal)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={subtotal === 0}
        className={`mt-8 w-full py-3 rounded-xl text-base font-medium transition duration-200 ${
          subtotal > 0
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Proceed to Checkout
      </button>

      <Link
        href="/products"
        className="block text-center mt-6 text-blue-600 dark:text-blue-400 hover:underline"
      >
        Continue Shopping
      </Link>

      {/* ✨ Updated Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-[90%] max-w-sm transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
              Please Log In
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              You must log in before proceeding to checkout.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLoginRedirect}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Log In
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

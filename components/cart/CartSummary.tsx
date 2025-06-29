"use client";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/price";
import { useRouter } from "next/navigation";

export default function CartSummary() {
  const subtotal = useCartStore((state) => state.getSubtotal());
  const router = useRouter();

  const handleCheckout = () => {
    if (subtotal > 0) {
      router.push("/checkout");
    } else {
      alert("Your cart is empty.");
    }
  };

  return (
    <div className="sticky top-24 bg-white dark:bg-gray-900 border rounded-xl p-6 shadow-md h-fit">
      <h3 className="text-xl font-bold mb-6 text-center">Order Summary</h3>

      <div className="flex justify-between mb-2">
        <span>Subtotal:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <div className="flex justify-between text-green-600 font-semibold mb-4">
        <span>Discount:</span>
        <span>{formatPrice(0)}</span>
      </div>

      <div className="flex justify-between text-lg font-bold border-t pt-4">
        <span>Total:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <button
        onClick={handleCheckout}
        className="mt-8 bg-primary text-white w-full py-3 rounded-lg text-lg shadow hover:opacity-90 transition"
      >
        Proceed to Checkout
      </button>

      <Link
        href="/products"
        className="block text-center mt-6 text-blue-500 font-medium hover:underline"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

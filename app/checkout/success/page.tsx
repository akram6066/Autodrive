// app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart(); // make sure cart is clean after successful order
  }, [clearCart]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <CheckCircle className="mx-auto text-green-500 w-16 h-16" />
        <h1 className="text-3xl font-bold">Thank you!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your order has been placed successfully. We’ll contact you for delivery.
        </p>

        <Link href="/" className="inline-block mt-6 bg-primary text-white py-3 px-6 rounded-lg shadow hover:bg-opacity-90 transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

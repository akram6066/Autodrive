"use client";

import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="text-center py-24">
      <p className="text-gray-500 text-lg">🛒 Your cart is empty.</p>
      <Link
        href="/products"
        className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

"use client";

import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";

export default function CheckoutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 lg:space-y-0 lg:space-x-10 lg:flex">
      {/* Left: Checkout Form */}
      <div className="w-full lg:w-2/3 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <CheckoutForm />
      </div>

      {/* Right: Order Summary */}
      <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
        <OrderSummary />
      </div>
    </div>
  );
}

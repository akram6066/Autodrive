"use client";

import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cartStore";
import AddressInput from "./AddressInput";
import { formatPrice } from "@/utils/price";

const checkoutSchema = z.object({
  phone: z.string().regex(/^2547\d{8}$/, "Enter valid M-PESA number"),
  address: z.string().min(5, "Please enter a valid delivery address"),
});

type PaymentMethod = "mpesa" | "cod";

interface OrderResponse {
  orderId: string;
}

interface STKResponse {
  ResponseCode: string;
  errorMessage?: string;
}

export default function CheckoutForm() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [loading, setLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});

  useEffect(() => {
    setHasMounted(true);
    setSubtotal(getSubtotal());
  }, [getSubtotal, items]);

  const handleAddressChange = useCallback((value: string) => {
    setAddress(value);
  }, []);

  const handleCheckout = async () => {
    setErrors({}); // Clear previous errors

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (subtotal <= 0) {
      toast.error("Subtotal is zero.");
      return;
    }

    const validation = checkoutSchema.safeParse({ phone, address });

    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of validation.error.issues) {
        fieldErrors[issue.path[0] as "phone" | "address"] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }

    setLoading(true);

    try {
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          total: subtotal,
          phone,
          address,
          paymentMethod,
        }),
      });

      if (!orderRes.ok) throw new Error("Failed to create order");

      const { orderId }: OrderResponse = await orderRes.json();
      if (!orderId) throw new Error("Missing order ID");

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully! Pay on delivery.");
        clearCart();
        return;
      }

      const stkRes = await fetch("/api/checkout/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, orderId }),
      });

      if (!stkRes.ok) throw new Error("Failed to initiate M-PESA payment");

      const stkData: STKResponse = await stkRes.json();

      if (stkData.ResponseCode === "0") {
        toast.success("Payment request sent. Check your phone to complete.");
        clearCart();
      } else {
        toast.error(stkData.errorMessage || "M-PESA payment failed");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Checkout error:", err.message);
      toast.error(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-lg space-y-6">
      <h2 className="text-xl font-semibold">Delivery & Payment</h2>

      {/* Address Input */}
      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium">
          Delivery Address
        </label>
        <AddressInput
          id="address"
          value={address}
          onChange={handleAddressChange}
        />
        {errors.address && (
          <p id="address-error" className="text-sm text-red-600" role="alert">
            {errors.address}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <fieldset className="space-y-2 mt-4">
        <legend className="block text-sm font-medium">Payment Method</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="mpesa"
              checked={paymentMethod === "mpesa"}
              onChange={() => setPaymentMethod("mpesa")}
            />
            M-PESA
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            Pay on Delivery
          </label>
        </div>
      </fieldset>

      {/* Phone Input */}
      {paymentMethod === "mpesa" && (
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium mt-4">
            M-PESA Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2547xxxxxxxx"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={`w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white ${
              errors.phone ? "border-red-500" : ""
            }`}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm text-red-600" role="alert">
              {errors.phone}
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-primary text-white p-3 rounded-xl mt-4 text-lg shadow hover:opacity-90 transition disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : hasMounted
          ? paymentMethod === "mpesa"
            ? `Pay ${formatPrice(subtotal)} with M-PESA`
            : "Place Order (Pay on Delivery)"
          : "Preparing..."}
      </button>
    </div>
  );
}

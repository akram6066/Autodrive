"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cartStore";
import AddressInput from "./AddressInput";
import { formatPrice } from "@/utils/price";
import { useRouter } from "next/navigation";

// ---------- Types ----------
type PaymentMethod = "mpesa" | "cod";

// interface CartItem {
//   productId: string;
//   name: string;
//   price: number;
//   discountPrice?: number;
//   quantity: number;
// }

interface OrderResponse {
  orderId?: string;
  error?: string;
}

interface STKResponse {
  ResponseCode?: string;
  errorMessage?: string;
}

// ---------- Helpers ----------
const normalizePhone = (input: string) =>
  input.startsWith("07") ? `254${input.slice(1)}` : input;

const parseJSONSafe = async <T,>(res: Response): Promise<T | null> => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

// ---------- Main Component ----------
export default function CheckoutForm() {
  const { items, getSubtotal } = useCartStore();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, items]);

  useEffect(() => {
    if (items.length === 0) {
      setPhone("");
      setAddress("");
    }
  }, [items.length]);

  const validateForm = useCallback(() => {
    const phoneRequired = paymentMethod === "mpesa" || paymentMethod === "cod";

    const validationSchema = z.object({
      phone: phoneRequired
        ? z
            .string()
            .regex(/^(?:2547|07)\d{8}$/, "Enter a valid phone number starting with 07 or 2547")
        : z.string().optional(),
      address: z.string().min(5, "Please enter a valid delivery address"),
    });

    const validation = validationSchema.safeParse({ phone, address });

    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of validation.error.issues) {
        fieldErrors[issue.path[0] as keyof typeof errors] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form.");
      return false;
    }
    setErrors({});
    return true;
  }, [phone, address, paymentMethod]);

  const createOrder = useCallback(
    async (normalizedPhone: string): Promise<string | null> => {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          total: subtotal,
          phone: normalizedPhone,
          address,
          paymentMethod,
        }),
      });

      const data = await parseJSONSafe<OrderResponse>(res);

      if (!res.ok || !data?.orderId) {
        throw new Error(data?.error || "Failed to create order");
      }
      return data.orderId;
    },
    [items, subtotal, address, paymentMethod]
  );

  const initiateMpesaPayment = useCallback(async (normalizedPhone: string, orderId: string) => {
    const res = await fetch("/api/checkout/stk-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalizedPhone, orderId }),
    });

    const data = await parseJSONSafe<STKResponse>(res);

    if (!res.ok || data?.ResponseCode !== "0") {
      throw new Error(data?.errorMessage || "M-PESA payment failed");
    }
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    if (subtotal <= 0) {
      toast.error("Subtotal is zero.");
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    const normalizedPhone = normalizePhone(phone);

    try {
      const orderId = await createOrder(normalizedPhone);
      if (!orderId) return;

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully! Pay on delivery.");
        router.push("/checkout/success");
        return;
      }

      await initiateMpesaPayment(normalizedPhone, orderId);
      toast.success("Payment request sent. Check your phone to complete.");
      router.push("/checkout/success");
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [items, subtotal, validateForm, phone, paymentMethod, createOrder, initiateMpesaPayment, router]);

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-lg space-y-6">
      <h2 className="text-xl font-semibold">Delivery & Payment</h2>

      {/* Address Input */}
      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium">
          Delivery Address
        </label>
        <AddressInput id="address" value={address} onChange={setAddress} />
        {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
      </div>

      {/* Payment Method */}
      <fieldset className="space-y-2 mt-4">
        <legend className="block text-sm font-medium">Payment Method</legend>
        <div className="flex gap-6">
          {(["mpesa", "cod"] as PaymentMethod[]).map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
              />
              {method === "mpesa" ? "M-PESA" : "Pay on Delivery"}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Phone Input */}
      {(paymentMethod === "mpesa" || paymentMethod === "cod") && (
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium mt-4">
            {paymentMethod === "mpesa" ? "M-PESA Number" : "Your Phone Number"}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xxxxxxxx or 2547xxxxxxxx"
            className={`w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white ${
              errors.phone ? "border-red-500" : ""
            }`}
          />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
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
          : paymentMethod === "mpesa"
          ? `Pay ${formatPrice(subtotal)} with M-PESA`
          : "Place Order (Pay on Delivery)"}
      </button>
    </div>
  );
}

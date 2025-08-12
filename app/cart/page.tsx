"use client";

import dynamic from "next/dynamic";
import Head from "next/head";
import { useCartStore } from "@/store/cartStore";
import EmptyCart from "@/components/cart/EmptyCart";
import { useHydrated } from "@/hooks/useHasHydrated";

const CartItem = dynamic(() => import("@/components/cart/CartItem"), { ssr: false });
const CartSummary = dynamic(() => import("@/components/cart/CartSummary"), { ssr: false });

export default function CartPage() {
  const hydrated = useHydrated();
  const { items, clearCart } = useCartStore();

  if (!hydrated) return null; // avoid mismatch on first render

  return (
    <>
      <Head>
        <title>Shopping Cart | AutoDrive</title>
        <meta name="description" content="Review and manage your items before checkout." />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-10 text-center">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6 max-h-[75vh] overflow-y-auto pr-1 sm:pr-4">
              {items.map((item, index) => (
                <CartItem
                  key={`${item.productId}-${item.variant?.brand || ""}-${item.variant?.size || ""}-${index}`}
                  item={item}
                />
              ))}
              <div className="pt-6 text-right">
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:underline"
                  aria-label="Clear Entire Cart"
                >
                  Clear Entire Cart
                </button>
              </div>
            </div>
            <CartSummary />
          </div>
        )}
      </div>
    </>
  );
}

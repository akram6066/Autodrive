"use client";
import { useCartStore } from "@/store/cartStore";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";

export default function CartPage() {
  const { items, clearCart } = useCartStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-10 text-center">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6 max-h-[75vh] overflow-y-auto pr-1 sm:pr-4">
            {items.map((item) => (
              <CartItem key={`${item.productId}-${item.variant}`} item={item} />
            ))}
            <div className="pt-6 text-right">
              <button
                onClick={clearCart}
                className="text-red-500 hover:underline"
              >
                Clear Entire Cart
              </button>
            </div>
          </div>

          <CartSummary />
        </div>
      )}
    </div>
  );
}

// components/products/AddToCartButton.tsx

"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    const item = {
      productId: product._id,
      name: product.name,
      price: product.brands[0]?.sizes[0]?.price ?? 0,
      discountPrice: product.discountPrice ?? 0,
      image: product.image || "/no-image.png",
      variant: product.brands[0]?.sizes[0]?.size ?? "Default",
      quantity: 1,
    };
    addItem(item);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="flex-1 bg-primary text-white py-3 rounded-xl text-lg font-semibold hover:scale-105"
    >
      <ShoppingCart className="inline mr-2" /> Add to Cart
    </button>
  );
}

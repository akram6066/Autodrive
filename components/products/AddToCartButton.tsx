"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

interface Props {
  product: Product;
  selectedSize?: {
    size: string;
    price: number;
    brandName: string;
  };
}

export default function AddToCartButton({ product, selectedSize }: Props) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Fallback to first brand + size if no size was selected
    const fallbackBrand = product.brands[0];
    const fallbackSize = fallbackBrand?.sizes[0];

    const brand = selectedSize?.brandName ?? fallbackBrand?.brandName;
    const size = selectedSize?.size ?? fallbackSize?.size;
    const price = selectedSize?.price ?? fallbackSize?.price;

    if (!brand || !size || price == null) {
      toast.error("No available brand or size selected");
      return;
    }

    const item = {
      productId: product.id,
      name: product.name,
      price: price,
      discountPrice: product.discountPrice ?? price,
      image: product.image || "/no-image.png",
      variant: {
        brand,
        size,
      },
      quantity: 1,
    };

    addItem(item);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="flex-1 bg-primary text-white py-3 rounded-xl text-lg font-semibold hover:scale-105 transition"
    >
      <ShoppingCart className="inline mr-2" /> Add to Cart
    </button>
  );
}

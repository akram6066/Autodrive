"use client";

import React, { useState } from "react";
//import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface BrandSize {
  size: string;
  price: number;
}
interface Brand {
  brandName: string;
  sizes: BrandSize[];
}
interface Category {
  _id: string;
  name: string;
  slug: string;
}
export interface Product {
  _id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  quantity: number;
  brands: Brand[];
  image?: string;
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const originalPrice = product.brands[0]?.sizes[0]?.price ?? 0;
  const discount = product.discountPrice ?? originalPrice;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - discount) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const item = {
      productId: product._id,
      name: product.name,
      price: originalPrice,
      discountPrice: product.discountPrice ?? 0,
      image: product.image || "/no-image.png",
      variant: product.brands[0]?.sizes[0]?.size ?? "Default",
      quantity: 1,
    };

    addItem(item);
    toast.success(`${product.name} added to cart!`);
  };

  const handleNavigate = () => {
    setIsLoading(true);
    router.push(`/products/${product.slug}`);
  };

  return (
    <div
      className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border relative overflow-hidden flex flex-col justify-between ${
        isLoading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Skeleton overlay when loading */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      <div
        onClick={handleNavigate}
        className="cursor-pointer transition active:scale-95 duration-100"
      >
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={product.image || "/no-image.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />
          {product.isOffer && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
              🔥 SALE
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            {product.name}
            <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
              {product.brands[0]?.sizes[0]?.size ?? "-"}
            </span>
          </h3>
          <p className="text-xs text-gray-500">{product.category?.name}</p>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={`${product._id}-star-${i}`}
                size={16}
                className={`${
                  i < (product.rating ?? 4)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill={i < (product.rating ?? 4) ? "yellow" : "none"}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 mb-2">
          {product.discountPrice ? (
            <>
              <span className="text-gray-400 text-sm line-through">
                KES {originalPrice}
              </span>
              <span className="text-red-600 text-xl font-bold">
                KES {discount}
              </span>
              <span className="text-green-600 text-xs font-semibold">
                ({discountPercent}% OFF)
              </span>
            </>
          ) : (
            <span className="text-black text-xl font-bold">
              KES {originalPrice}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            {product.quantity} in stock
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

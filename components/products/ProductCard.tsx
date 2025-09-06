"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import RatingStar from "@/components/reviews/RatingStar";
import type { CartItem } from "@/types/CartItem";

/* ---------------------- Types ---------------------- */
interface BrandSize {
  size: string;
  price: number;
}

interface Brand {
  brandName: string;
  sizes: BrandSize[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category | null;
  description: string;
  quantity: number;
  brands: Brand[];
  image?: string;
  images?: string[];
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
}

export interface ProductCardProps {
  product: Product;
  isLoggedIn?: boolean;
}

/* ---------------------- Utils ---------------------- */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

/* ---------------------- Component ---------------------- */
function ProductCard({ product, isLoggedIn = false }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  /** --- Derived values --- */
  const brand = product.brands?.[0] ?? null;
  const size = brand?.sizes?.[0] ?? null;

  const originalPrice = size?.price ?? 0;
  const finalPrice = product.discountPrice ?? originalPrice;

  const discountPercent = useMemo(() => {
    return originalPrice > 0
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;
  }, [originalPrice, finalPrice]);

  /** --- SWR for rating --- */
  const { data: stats, mutate, isLoading } = useSWR<{ averageRating: number }>(
    product.id ? `/api/reviews/product/${product.id}/stats` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const averageRating = stats?.averageRating ?? 0;

  /** --- Handlers --- */
  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!brand || !size) {
        toast.error("No available brand/size variant");
        return;
      }

      const item: CartItem = {
        productId: product.id,
        name: product.name,
        price: size.price,
        discountPrice: product.discountPrice ?? size.price,
        image: product.image?.trim() || "/no-image.png",
        variant: { brand: brand.brandName || "Unknown", size: size.size },
        quantity: 1,
      };

      addItem(item);
      toast.success(`${product.name} added to cart`);
    },
    [addItem, brand, size, product]
  );

  const handleNavigate = useCallback(() => {
    router.push(`/products/${product.slug}`);
  }, [router, product.slug]);

  const handleRate = useCallback(
    async (rating: number) => {
      if (!isLoggedIn) {
        toast.error("Please log in to rate products");
        return;
      }
      try {
        const res = await fetch(`/api/reviews/product/${product.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment: "" }),
        });
        if (!res.ok) throw new Error("Failed to submit rating");

        toast.success(`You rated ${product.name} ${rating} stars`);
        mutate();
      } catch {
        toast.error("Failed to submit rating");
      }
    },
    [product, mutate, isLoggedIn]
  );

  /** --- UI Fragments --- */
  const priceDisplay = useMemo(() => {
    if (!originalPrice) return <span className="text-gray-500">N/A</span>;

    return product.discountPrice ? (
      <>
        <span className="text-gray-400 text-sm line-through">
          KES {originalPrice}
        </span>
        <span className="text-red-600 text-xl font-bold">KES {finalPrice}</span>
        {discountPercent > 0 && (
          <span className="text-green-600 text-xs font-semibold">
            ({discountPercent}% OFF)
          </span>
        )}
      </>
    ) : (
      <span className="text-black text-xl font-bold">KES {originalPrice}</span>
    );
  }, [product.discountPrice, originalPrice, finalPrice, discountPercent]);

  const ratingDisplay = isLoading ? (
    <div className="animate-pulse h-4 w-24 bg-gray-200 rounded" />
  ) : (
    <RatingStar
      productId={product.id}
      averageRating={averageRating}
      onRate={isLoggedIn ? handleRate : undefined}
      size={14}
    />
  );

  return (
    <div
      onClick={handleNavigate}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border relative overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* --- Product Image --- */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <Image
          src={product.image || "/no-image.png"}
          alt={product.name || "Product image"}
          fill
          priority={false}
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.isOffer && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
            🔥 SALE
          </div>
        )}
      </div>

      {/* --- Product Info --- */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          {product.name}
          {size?.size && (
            <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
              {size.size}
            </span>
          )}
        </h3>
        <p className="text-xs text-gray-500 truncate">{product.category?.name}</p>
        {ratingDisplay}
      </div>

      {/* --- Price & Cart --- */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 mb-2">{priceDisplay}</div>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!brand || !size || product.quantity <= 0}
            aria-label={`Add ${product.name} to cart`}
            className="bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCard);

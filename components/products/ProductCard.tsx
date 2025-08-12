"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import type { CartItem } from "@/types/CartItem";

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
}

interface Props {
  product: Product;
}

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RatingStars: React.FC<{
  productId: string;
  averageRating: number;
  onRate: (rating: number) => void;
}> = React.memo(({ productId, averageRating, onRate }) => {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        const active = starIndex <= (hovered ?? averageRating);
        return (
          <Star
            key={`${productId}-star-${i}`}
            size={16}
            className={active ? "text-yellow-400 cursor-pointer" : "text-gray-300 cursor-pointer"}
            fill={active ? "yellow" : "none"}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setHovered(starIndex);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              setHovered(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRate(starIndex);
            }}
          />
        );
      })}
    </div>
  );
});
RatingStars.displayName = "RatingStars";

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const brand = product.brands?.[0] ?? null;
  const size = brand?.sizes?.[0] ?? null;

  const originalPrice = size?.price ?? 0;
  const discount = product.discountPrice ?? originalPrice;
  const discountPercent =
    originalPrice > 0 ? Math.round(((originalPrice - discount) / originalPrice) * 100) : 0;

  // Cached rating fetch
  const { data: stats, mutate } = useSWR<{ averageRating: number }>(
    `/api/reviews/product/${product._id}/stats`,
    fetcher
  );
  const averageRating = stats?.averageRating || 0;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!brand || !size) {
        toast.error("No available brand/size variant");
        return;
      }

      const item: CartItem = {
        productId: String(product._id),
        name: product.name,
        price: Number(size.price),
        discountPrice: Number(product.discountPrice ?? size.price),
        image: product.image?.trim() || "/no-image.png",
        variant: {
          brand: brand.brandName || "Unknown",
          size: size.size || "Default",
        },
        quantity: 1,
      };

      addItem(item);
      toast.success(`${product.name} added to cart!`);
    },
    [addItem, brand, size, product]
  );

  const handleNavigate = useCallback(() => {
    router.push(`/products/${product.slug}`);
  }, [router, product.slug]);

  const handleRate = useCallback(
    async (rating: number) => {
      try {
        const res = await fetch(`/api/reviews/product/${product._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment: "" }),
        });
        if (!res.ok) throw new Error();
        toast.success(`You rated ${product.name} ${rating} stars`);
        mutate(); // revalidate SWR
      } catch {
        toast.error("Failed to submit rating");
      }
    },
    [product, mutate]
  );

  const priceDisplay = useMemo(() => {
    if (product.discountPrice) {
      return (
        <>
          <span className="text-gray-400 text-sm line-through">KES {originalPrice}</span>
          <span className="text-red-600 text-xl font-bold">KES {discount}</span>
          {discountPercent > 0 && (
            <span className="text-green-600 text-xs font-semibold">({discountPercent}% OFF)</span>
          )}
        </>
      );
    }
    return <span className="text-black text-xl font-bold">KES {originalPrice}</span>;
  }, [product.discountPrice, originalPrice, discount, discountPercent]);

  return (
    <div
      onClick={handleNavigate}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border relative overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* Image */}
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

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          {product.name}
          {size?.size && (
            <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
              {size.size}
            </span>
          )}
        </h3>
        <p className="text-xs text-gray-500">{product.category?.name}</p>

        {/* Ratings */}
        <RatingStars
          productId={product._id}
          averageRating={averageRating}
          onRate={handleRate}
        />
      </div>

      {/* Price & Cart */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 mb-2">{priceDisplay}</div>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            {product.quantity} in stock
          </span>
          <button
            onClick={handleAddToCart}
            className={`bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform ${
              !brand || !size ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!brand || !size}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

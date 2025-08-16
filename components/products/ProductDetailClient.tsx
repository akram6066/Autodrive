"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ProductGallery from "@/components/products/ProductGallery";
import ProductTabs from "@/components/products/ProductTabs";
import AddToCartButton from "@/components/products/AddToCartButton";
import { Heart, Truck, RotateCcw } from "lucide-react";
import { formatPrice } from "@/utils/price";
import type { Product } from "@/types/product";
import StarRating from "@/components/reviews/StarRating";
import ReviewForm from "@/components/reviews/ReviewForm";

const WhatsAppMessageButton = dynamic(
  () => import("@/components/WhatsAppMessageButton"),
  { ssr: false }
);

type Stats = { averageRating: number; totalReviews: number };

export default function ProductDetailClient({ product }: { product: Product }) {
  const [productUrl, setProductUrl] = useState("");
  const [stats, setStats] = useState<Stats>({ averageRating: 0, totalReviews: 0 });

  // Derived values (memoized for performance)
  const originalPrice = useMemo(
    () => product.brands?.[0]?.sizes?.[0]?.price ?? 0,
    [product.brands]
  );

  const discount = useMemo(
    () => product.discountPrice ?? originalPrice,
    [product.discountPrice, originalPrice]
  );

  const discountPercent = useMemo(
    () => (originalPrice > 0 ? Math.round(((originalPrice - discount) / originalPrice) * 100) : 0),
    [originalPrice, discount]
  );

  const galleryImages = useMemo(
    () => (product.images?.length ? product.images : [product.image]),
    [product.images, product.image]
  );

  // Capture current URL client-side
  useEffect(() => {
    if (typeof window !== "undefined") setProductUrl(window.location.href);
  }, []);

  // Fetch product review stats
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/reviews/product/${product.id}/stats`, {
      signal: controller.signal,
      cache: "no-cache",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Partial<Stats> | null) => {
        if (data) {
          setStats({
            averageRating: Number(data.averageRating ?? 0),
            totalReviews: Number(data.totalReviews ?? 0),
          });
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Stats fetch error:", err);
      });

    return () => controller.abort();
  }, [product.id]);

  return (
    <main className="max-w-7xl mx-auto py-16 px-4">
      <section className="grid md:grid-cols-2 gap-10">
        {/* Product Images */}
        <ProductGallery images={galleryImages} name={product.name} isOffer={product.isOffer} />

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-primary mb-4">{product.name}</h1>

            {/* Ratings */}
            <div className="flex items-center mb-4">
              <StarRating rating={stats.averageRating} size={24} />
              <span className="ml-2 text-sm text-gray-500">
                ({stats.averageRating.toFixed(1)} rating, {stats.totalReviews} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4">{product.description}</p>

            {/* Category */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <span>Category:</span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                {product.category?.name ?? "Uncategorized"}
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-4 mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-red-600">{formatPrice(discount)}</span>
                  <span className="text-lg line-through text-gray-400">{formatPrice(originalPrice)}</span>
                  <span className="text-green-600 font-semibold text-sm">
                    ({discountPercent}% OFF)
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-black">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {/* Sizes */}
            {product.brands?.[0]?.sizes?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-2 text-lg">Available Sizes:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.brands[0].sizes.map((size, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
                    >
                      {size.size} - {formatPrice(size.price)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <AddToCartButton product={product} />
              <button
                className="border border-gray-300 text-primary p-3 rounded-xl hover:scale-105"
                aria-label="Add to wishlist"
              >
                <Heart />
              </button>
              <WhatsAppMessageButton
                productName={product.name}
                variant={product.brands?.[0]?.sizes?.[0]?.size}
                quantity={1}
                productUrl={productUrl}
                className="border border-gray-300 p-3 rounded-xl cursor-pointer hover:scale-105 flex items-center justify-center"
              />
            </div>

            {/* Review Form */}
            <ReviewForm productId={product.id} onStatsUpdate={setStats} />
          </div>

          {/* Extra Info */}
          <div className="flex flex-col md:flex-row gap-8 text-sm text-gray-600 mt-6">
            <div className="flex items-center gap-3">
              <Truck /> Free Shipping over KSh 100,000
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw /> 30-Day Return Guarantee
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <ProductTabs description={product.description} />
    </main>
  );
}

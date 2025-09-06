"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ProductGallery from "@/components/products/ProductGallery";
import ProductTabs from "@/components/products/ProductTabs";
import AddToCartButton from "@/components/products/AddToCartButton";

import { formatPrice } from "@/utils/price";
import type { Product } from "@/types/product";
import toast from "react-hot-toast";
import WishlistButton from "@/components/wishlist/WishlistButton";

// Lazy load heavy components
const RatingStar = dynamic(() => import("@/components/reviews/RatingStar"));
const ReviewForm = dynamic(() => import("@/components/reviews/ReviewForm"));
const ReviewList = dynamic(() => import("@/components/reviews/ReviewList"));
const WhatsAppMessageButton = dynamic(
  () => import("@/components/WhatsAppMessageButton"),
  { ssr: false }
);

type Stats = { averageRating: number; totalReviews: number };
type ProductWithMongoId = Product & { _id?: string };

function ProductDetailClient({ product }: { product: ProductWithMongoId }) {
  const [productUrl, setProductUrl] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const productId: string = product.id ?? product._id ?? "";

  // Prices
  const originalPrice = useMemo(
    () => product.brands?.[0]?.sizes?.[0]?.price ?? 0,
    [product.brands]
  );
  const discount = useMemo(
    () => product.discountPrice ?? originalPrice,
    [product.discountPrice, originalPrice]
  );
  const discountPercent = useMemo(
    () =>
      originalPrice > 0
        ? Math.round(((originalPrice - discount) / originalPrice) * 100)
        : 0,
    [originalPrice, discount]
  );

  // Gallery
  const galleryImages = useMemo(() => {
    if (product.images?.length) return product.images.filter(Boolean);
    return product.image ? [product.image] : ["/no-image.png"];
  }, [product.images, product.image]);

  // Product URL
  useEffect(() => {
    if (typeof window !== "undefined") setProductUrl(window.location.href);
  }, []);

  // Reviews stats
  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();

    (async () => {
      setLoadingStats(true);
      try {
        const res = await fetch(`/api/reviews/product/${productId}/stats`, {
          signal: controller.signal,
          cache: "no-cache",
        });
        if (!res.ok) throw new Error("Failed to fetch review stats");
        const data: Partial<Stats> = await res.json();
        setStats({
          averageRating: Number(data.averageRating ?? 0),
          totalReviews: Number(data.totalReviews ?? 0),
        });
      } catch (err) {
        if (!(err instanceof DOMException)) {
          toast.error("Failed to load reviews");
          console.error("Stats fetch error:", err);
        }
      } finally {
        setLoadingStats(false);
      }
    })();

    return () => controller.abort();
  }, [productId]);

  return (
    <main className="max-w-7xl mx-auto py-16 px-4">
      <section className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <ProductGallery
          images={galleryImages}
          name={product.name}
          isOffer={product.isOffer}
        />

        {/* Right side */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-primary mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {productId && (
              <div className="flex items-center mb-4">
                <RatingStar
                  productId={productId}
                  averageRating={stats?.averageRating ?? 0}
                  size={24}
                />
                <span className="ml-2 text-sm text-gray-500">
                  {loadingStats
                    ? "Loading reviews..."
                    : `(${stats?.averageRating?.toFixed(1) ?? 0} rating, ${
                        stats?.totalReviews ?? 0
                      } reviews)`}
                </span>
              </div>
            )}

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
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(discount)}
                  </span>
                  <span className="text-lg line-through text-gray-400">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="text-green-600 font-semibold text-sm">
                    ({discountPercent}% OFF)
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-black">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Sizes */}
            {product.brands?.[0]?.sizes?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-2 text-lg">Available Sizes:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.brands[0].sizes.map((size) => (
                    <span
                      key={size.size}
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

              {/* ❤️ Wishlist Button */}
              <WishlistButton product={product} className="p-3 rounded-xl" />

              <WhatsAppMessageButton
                productName={product.name}
                variant={product.brands?.[0]?.sizes?.[0]?.size}
                quantity={1}
                productUrl={productUrl}
                className="border border-gray-300 p-3 rounded-xl cursor-pointer hover:scale-105 flex items-center justify-center"
              />
            </div>

            {/* Reviews */}
            {productId && (
              <section id="reviews" className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <ReviewForm productId={productId} onStatsUpdate={setStats} />
                <div className="mt-8">
                  <ReviewList productId={productId} />
                </div>
              </section>
            )}
          </div>

          {/* Footer info */}
          <div className="flex flex-col md:flex-row gap-8 text-sm text-gray-600 mt-6">
            <div className="flex items-center gap-3">
              <span className="text-green-600">🚚</span> Free Shipping over KSh
              100,000
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-600">↩️</span> 30-Day Return Guarantee
            </div>
          </div>
        </div>
      </section>

      <ProductTabs description={product.description} />
    </main>
  );
}

export default ProductDetailClient;

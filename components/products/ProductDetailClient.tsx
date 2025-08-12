"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ProductGallery from "@/components/products/ProductGallery";
import ProductTabs from "@/components/products/ProductTabs";
import AddToCartButton from "@/components/products/AddToCartButton";
import { Heart, Truck, RotateCcw, Star } from "lucide-react";
import { formatPrice } from "@/utils/price";
import type { Product } from "@/types/product";

const WhatsAppMessageButton = dynamic(
  () => import("@/components/WhatsAppMessageButton"),
  { ssr: false }
);

type Stats = {
  averageRating: number;
  totalReviews: number;
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const [productUrl, setProductUrl] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ averageRating: 0, totalReviews: 0 });
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>("");
  const [loadingReview, setLoadingReview] = useState<boolean>(false);

  // memoize derived values
  const originalPrice = useMemo(
    () => product.brands?.[0]?.sizes?.[0]?.price ?? 0,
    [product.brands]
  );

  const discount = useMemo(() => product.discountPrice ?? originalPrice, [
    product.discountPrice,
    originalPrice,
  ]);

  const discountPercent = useMemo(
    () => (originalPrice > 0 ? Math.round(((originalPrice - discount) / originalPrice) * 100) : 0),
    [originalPrice, discount]
  );

  const galleryImages = useMemo(
    () => (product.images && product.images.length > 0 ? product.images : [product.image]),
    [product.images, product.image]
  );

  // set product url safely (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setProductUrl(window.location.href);
    }
  }, []);

  // fetch review stats with abort controller and safe handling
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`/api/reviews/product/${product._id}/stats`, {
          signal: controller.signal,
          cache: "no-cache",
        });
        if (!res.ok) {
          // non-fatal, keep default stats
          console.error("Failed to fetch stats", { status: res.status });
          return;
        }
        const data = (await res.json()) as Partial<Stats> | null;
        if (data) {
          setStats({
            averageRating: Number(data.averageRating ?? 0),
            totalReviews: Number(data.totalReviews ?? 0),
          });
        }
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        console.error("Error fetching stats:", err);
      }
    };

    load();
    return () => controller.abort();
  }, [product._id]);

  // review submit - memoized and strongly typed errors
  const handleReviewSubmit = useCallback(async () => {
    // basic validation
    if (!commentInput.trim()) {
      // replace with toast if desired
      window.alert("Please write a comment before submitting.");
      return;
    }
    if (ratingInput < 1 || ratingInput > 5) {
      window.alert("Please select a valid rating between 1 and 5.");
      return;
    }

    setLoadingReview(true);
    const controller = new AbortController();

    try {
      const res = await fetch(`/api/reviews/product/${product._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput.trim() }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // try to parse error message safely
        let msg = "Failed to submit review";
        try {
          const errorData = await res.json();
          if (errorData && typeof errorData.message === "string") msg = errorData.message;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(msg);
      }

      // optimistic update: fetch stats again (and update UI)
      const statsRes = await fetch(`/api/reviews/product/${product._id}/stats`, {
        cache: "no-cache",
      });

      if (statsRes.ok) {
        const updatedStats = (await statsRes.json()) as Partial<Stats> | null;
        if (updatedStats) {
          setStats({
            averageRating: Number(updatedStats.averageRating ?? stats.averageRating),
            totalReviews: Number(updatedStats.totalReviews ?? stats.totalReviews),
          });
        }
      }

      // reset inputs
      setCommentInput("");
      setRatingInput(5);
      // optionally notify user here (toast)
    } catch (err) {
      if (err instanceof Error) {
        console.error("Review submission error:", err.message);
        window.alert(err.message);
      } else {
        console.error("Unexpected review error:", err);
        window.alert("Something went wrong while submitting your review.");
      }
    } finally {
      setLoadingReview(false);
      controller.abort();
    }
  }, [product._id, ratingInput, commentInput, stats.averageRating, stats.totalReviews]);

  return (
    <main className="max-w-7xl mx-auto py-16 px-4">
      <section className="grid md:grid-cols-2 gap-10">
        <ProductGallery images={galleryImages} name={product.name} isOffer={product.isOffer} />

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-primary mb-4">{product.name}</h1>

            <div className="flex items-center mb-4">
              {Array.from({ length: 5 }, (_, i) => {
                const filled = i + 1 <= Math.round(stats.averageRating);
                return (
                  <Star
                    key={i}
                    size={24}
                    className={filled ? "text-yellow-400" : "text-gray-300"}
                    fill={filled ? "yellow" : "none"}
                  />
                );
              })}
              <span className="ml-2 text-sm text-gray-500">
                ({stats.averageRating.toFixed(1)} rating, {stats.totalReviews} reviews)
              </span>
            </div>

            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <span>Category:</span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{product.category.name}</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-red-600">{formatPrice(discount)}</span>
                  <span className="text-lg line-through text-gray-400">{formatPrice(originalPrice)}</span>
                  <span className="text-green-600 font-semibold text-sm">({discountPercent}% OFF)</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-black">{formatPrice(originalPrice)}</span>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-2 text-lg">Available Sizes:</h3>
              <div className="flex flex-wrap gap-3">
                {product.brands?.[0]?.sizes?.map((size, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                    {size.size} - {formatPrice(size.price)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <AddToCartButton product={product} />
              <button className="border border-gray-300 text-primary p-3 rounded-xl hover:scale-105">
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

            {/* Review form */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Write a Review</h3>

              <select
                value={ratingInput}
                onChange={(e) => setRatingInput(Number(e.target.value))}
                className="border p-2 rounded mb-2"
                aria-label="Rating"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>

              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write your comment..."
                className="border p-2 rounded w-full mb-2"
                rows={4}
                aria-label="Comment"
              />

              <button
                onClick={handleReviewSubmit}
                disabled={loadingReview}
                className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
                aria-busy={loadingReview}
              >
                {loadingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>

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

      <ProductTabs description={product.description} />
    </main>
  );
}

"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import RatingStar from "./RatingStar";
import { signIn } from "next-auth/react";

type Stats = { averageRating: number; totalReviews: number };

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
  onStatsUpdate?: (stats: Stats) => void;
}

async function submitReview(productId: string, rating: number, comment: string) {
  return fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, rating, comment }),
  });
}

async function fetchStats(productId: string): Promise<Stats | null> {
  try {
    const res = await fetch(`/api/reviews/product/${productId}/stats`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      averageRating: Number(data.averageRating ?? 0),
      totalReviews: Number(data.totalReviews ?? 0),
    };
  } catch {
    return null;
  }
}

export default function ReviewForm({
  productId,
  onReviewSubmitted,
  onStatsUpdate,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!rating) {
        toast.error("Please select a rating");
        return;
      }
      if (!comment.trim()) {
        toast.error("Please write a review");
        return;
      }

      setLoading(true);
      try {
        const res = await submitReview(productId, rating, comment);

        if (res.status === 401) {
          toast.error("Please log in to write a review.", {
            action: { label: "Login", onClick: () => signIn() },
          });
          return;
        }

        if (!res.ok) {
          const { error } = await res.json().catch(() => ({}));
          throw new Error(error || "Failed to submit review");
        }

        toast.success("⭐ Thanks for your rating!", {
          description: "Your review has been submitted successfully.",
        });

        // Reset form
        setRating(0);
        setComment("");
        onReviewSubmitted?.();

        // Refresh stats if callback provided
        if (onStatsUpdate) {
          const stats = await fetchStats(productId);
          if (stats) onStatsUpdate(stats);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [productId, rating, comment, onReviewSubmitted, onStatsUpdate]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 rounded-lg shadow-sm"
      aria-label="Submit a review"
    >
      <div>
        <label className="block mb-1 font-medium">Your Rating</label>
        <RatingStar rating={rating} onChange={setRating} size={28} />
      </div>

      <div>
        <label htmlFor="comment" className="block mb-1 font-medium">
          Your Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience..."
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          aria-required="true"
          aria-invalid={!comment.trim()}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        aria-busy={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

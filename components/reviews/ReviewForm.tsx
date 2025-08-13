"use client";

import { useState } from "react";
import { toast } from "sonner";
import StarRating from "./StarRating";

type Stats = { averageRating: number; totalReviews: number };

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
  onStatsUpdate?: (stats: Stats) => void; // ✅ added this prop
}

export default function ReviewForm({
  productId,
  onReviewSubmitted,
  onStatsUpdate,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onReviewSubmitted?.();

      // ✅ Refetch stats after submission
      if (onStatsUpdate) {
        const statsRes = await fetch(`/api/reviews/product/${productId}/stats`);
        if (statsRes.ok) {
          const data = await statsRes.json();
          onStatsUpdate({
            averageRating: Number(data.averageRating ?? 0),
            totalReviews: Number(data.totalReviews ?? 0),
          });
        }
      }
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 rounded-lg shadow-sm"
      aria-label="Submit a review"
    >
      <div>
        <label className="block mb-1 font-medium">Your Rating</label>
        <StarRating rating={rating} onChange={setRating} size={28} />
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
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

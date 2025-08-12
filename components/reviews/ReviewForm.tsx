// components/ReviewForm.tsx
"use client";

import React, { useState } from "react";

type ReviewFormProps = {
  productId: string;
  onSuccess?: () => void; // optional callback so page can refresh reviews
};

type ApiError = { error?: string };

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        setError(data.error ?? "Failed to submit");
      } else {
        setComment("");
        setRating(5);
        onSuccess?.();
      }
    } catch  {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <div className="text-red-600">{error}</div> : null}
      <label className="block">
        Rating
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="ml-2"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </label>

      <textarea
        className="w-full p-2 border rounded"
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />

      <button
        onClick={submitReview}
        disabled={loading || comment.trim().length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

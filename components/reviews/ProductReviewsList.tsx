// components/ProductReviewsList.tsx
"use client";

import React, { useEffect, useState } from "react";

type UserLite = { _id: string; name?: string; image?: string };
type ReviewResponse = {
  _id: string;
  user: UserLite;
  product: { _id: string };
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ProductReviewsList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      if (res.ok) {
        const data = (await res.json()) as ReviewResponse[];
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchReviews();
  }, [productId]);

  if (loading) return <div>Loading reviews...</div>;
  if (reviews.length === 0) return <div>No reviews yet.</div>;

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r._id} className="border p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {r.user?.image ? (
                <img src={r.user.image} alt={r.user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300" />
              )}
              <div>
                <div className="font-medium">{r.user?.name ?? "User"}</div>
                <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="font-semibold">{r.rating} / 5</div>
          </div>

          <p className="mt-2">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}

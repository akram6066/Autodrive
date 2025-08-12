// components/ProductRatingSummary.tsx
"use client";

import React, { useEffect, useState } from "react";

type ProductRatingSummaryProps = {
  productId: string;
};

type RatingStats = {
  averageRating: number;
  totalReviews: number;
};

export default function ProductRatingSummary({ productId }: ProductRatingSummaryProps) {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/product/${productId}/stats`);
      if (res.ok) {
        const data = (await res.json()) as RatingStats;
        setStats(data);
      } else {
        setStats({ averageRating: 0, totalReviews: 0 });
      }
    } catch {
      setStats({ averageRating: 0, totalReviews: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchStats();
  }, [productId]);

  if (loading) return <div>Loading rating...</div>;
  if (!stats) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-yellow-500">★</span>
      <span className="font-medium">
        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "No ratings yet"}
      </span>
      {stats.totalReviews > 0 && (
        <span className="text-gray-500 text-sm">({stats.totalReviews} reviews)</span>
      )}
    </div>
  );
}

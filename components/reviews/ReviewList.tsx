"use client";

import useSWRInfinite from "swr/infinite";
import Image from "next/image";
import React from "react";
import RatingStars from "./RatingStar";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  badge?: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

interface ReviewApiResponse {
  reviews: Review[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

// Shared fetcher
const fetcher = async (url: string): Promise<ReviewApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
};

// Date formatter (stable instance)
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default function ReviewList({ productId }: { productId: string }) {
  const getKey = (pageIndex: number, previousPageData: ReviewApiResponse | null) => {
    if (previousPageData && pageIndex + 1 > previousPageData.pagination.totalPages) {
      return null; // no more pages
    }
    return `/api/reviews/product/${productId}?page=${pageIndex + 1}&limit=5&sortBy=newest`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite<ReviewApiResponse>(
    getKey,
    fetcher
  );

  if (error) {
    return <p className="text-sm text-red-500">Failed to load reviews.</p>;
  }
  if (!data) {
    return <p className="text-sm text-gray-400">Loading reviews...</p>;
  }

  // Flatten all reviews from all loaded pages
  const allReviews = data.flatMap((page) => page.reviews);
  const lastPage = data[data.length - 1];
  const hasMore = lastPage.pagination.page < lastPage.pagination.totalPages;

  return (
    <div className="space-y-4">
      {allReviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet</p>
      ) : (
        allReviews.map((review) => (
          <ReviewCard key={review._id} productId={productId} review={review} />
        ))
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setSize(size + 1)}
            disabled={isValidating}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isValidating ? "Loading..." : "Load More Reviews"}
          </button>
        </div>
      )}

      {/* Pagination Fallback */}
      {lastPage.pagination.totalPages > 1 && (
        <Pagination
          currentPage={lastPage.pagination.page}
          totalPages={lastPage.pagination.totalPages}
          onPageSelect={(page) => setSize(page)} // jump to page
        />
      )}
    </div>
  );
}

/** ---- Subcomponents ---- **/

const ReviewCard = React.memo(function ReviewCard({
  productId,
  review,
}: {
  productId: string;
  review: Review;
}) {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <Image
          src={review.user.image || "/no-avatar.png"}
          alt={review.user.name || "User avatar"}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="font-semibold">{review.user.name}</p>
          {review.badge && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {review.badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2">
        <RatingStars productId={productId} averageRating={review.rating} size={14} />
        <p className="mt-1 text-sm text-gray-700">{review.comment}</p>
        <p className="text-xs text-gray-400">
          {dateFormatter.format(new Date(review.createdAt))}
        </p>
      </div>
    </div>
  );
});

const Pagination = React.memo(function Pagination({
  currentPage,
  totalPages,
  onPageSelect,
}: {
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
}) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageSelect(page)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
});

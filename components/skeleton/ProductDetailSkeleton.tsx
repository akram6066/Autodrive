// components/skeletons/ProductDetailSkeleton.tsx
"use client";

export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image Skeleton */}
        <div className="w-full md:w-1/2">
          <div className="bg-gray-200 rounded-2xl w-full h-96 shimmer"></div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded-md w-3/4 shimmer"></div>

          {/* Price */}
          <div className="h-6 bg-gray-200 rounded-md w-1/3 shimmer"></div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-full shimmer"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded-md w-4/6 shimmer"></div>
          </div>

          {/* Add to Cart Button */}
          <div className="h-12 bg-gray-200 rounded-lg w-1/2 shimmer"></div>
        </div>
      </div>

      <style jsx>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          height: 100%;
          width: 150%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );
}

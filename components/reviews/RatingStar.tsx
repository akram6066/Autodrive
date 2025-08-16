"use client";

import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  productId: string;
  averageRating: number;
  onRate: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = React.memo(
  ({ productId, averageRating, onRate }) => {
    const [hovered, setHovered] = React.useState<number | null>(null);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starIndex = i + 1;
          const active = starIndex <= (hovered ?? averageRating);
          return (
            <Star
              key={`${productId}-star-${i}`}
              size={16}
              className={
                active
                  ? "text-yellow-400 cursor-pointer"
                  : "text-gray-300 cursor-pointer"
              }
              fill={active ? "yellow" : "none"}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setHovered(starIndex);
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setHovered(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onRate(starIndex);
              }}
            />
          );
        })}
      </div>
    );
  }
);

RatingStars.displayName = "RatingStars";
export default RatingStars;

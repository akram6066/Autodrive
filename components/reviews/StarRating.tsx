"use client";

import { memo, useState, KeyboardEvent } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

interface StarRatingProps {
  rating: number; // current selected rating
  onChange?: (rating: number) => void;
  max?: number;
  size?: number; // ✅ added prop for icon size
  readOnly?: boolean;
}

const StarRating = memo(function StarRating({
  rating,
  onChange,
  max = 5,
  size = 20,
  readOnly = false,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  const handleClick = (value: number) => {
    if (!readOnly && onChange) onChange(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, value: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(value);
    }
  };

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Star Rating"
    >
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = hover !== null ? value <= hover : value <= rating;

        return (
          <div
            key={value}
            role="radio"
            aria-checked={rating === value}
            tabIndex={readOnly ? -1 : 0}
            onMouseEnter={() => !readOnly && setHover(value)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => handleClick(value)}
            onKeyDown={(e) => handleKeyDown(e, value)}
            className={clsx(readOnly ? "cursor-default" : "cursor-pointer")}
          >
            <Star
              width={size}
              height={size}
              className={clsx(
                "transition-colors duration-200",
                filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )}
            />
          </div>
        );
      })}
    </div>
  );
});

export default StarRating;

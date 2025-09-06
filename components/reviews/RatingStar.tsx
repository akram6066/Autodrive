"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  productId?: string;
  averageRating?: number;   // Display-only (read-only)
  rating?: number;          // Controlled picker value
  userRating?: number;      // Logged-in user's rating
  isLoggedIn?: boolean;
  onRate?: (rating: number) => Promise<void> | void; // API callback
  onChange?: (rating: number) => void;               // Controlled mode callback
  size?: number;
  filledColor?: string;     // Tailwind/text class for filled stars
  emptyColor?: string;      // Tailwind/text class for empty stars
  hoverColor?: string;      // Tailwind/text class for hover stars
}

/**
 * StarRating component
 * - Supports display-only mode or interactive picker
 * - Prevents rating submission by guests unless allowed
 * - Handles async API rating with pending state
 * - Accessible with keyboard navigation
 */
const StarRating: React.FC<StarRatingProps> = ({
  productId,
  averageRating = 0,
  rating,
  userRating,
  isLoggedIn = false,
  onRate,
  onChange,
  size = 16,
  filledColor = "text-yellow-400",
  emptyColor = "text-gray-300",
  hoverColor = "text-yellow-500",
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  // Determine mode
  const isPicker = typeof rating === "number" && typeof onChange === "function";
  const isInteractive = isPicker || (isLoggedIn && typeof onRate === "function");

  // Which rating number should be displayed
  const displayRating = useMemo(() => {
    return isPicker
      ? (hovered ?? rating)
      : (hovered ?? userRating ?? averageRating);
  }, [isPicker, hovered, rating, userRating, averageRating]);

  // Precompute star fill states
  const starFillLevels = useMemo<("full" | "half" | "empty")[]>(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const starIndex = i + 1;
      if (displayRating >= starIndex) return "full";
      if (displayRating >= starIndex - 0.5) return "half";
      return "empty";
    });
  }, [displayRating]);

  // Handle rating change
  const handleRate = useCallback(async (value: number) => {
    if (!isInteractive || pending) return;

    if (isPicker) {
      onChange?.(value);
    } else if (onRate) {
      try {
        setPending(true);
        await onRate(value);
      } finally {
        setPending(false);
      }
    }
  }, [isInteractive, isPicker, onRate, onChange, pending]);

  return (
    <div
      className={`flex items-center gap-1 ${pending ? "opacity-50 pointer-events-none" : ""}`}
      aria-label="Star rating"
    >
      {starFillLevels.map((fill, i) => {
        const starIndex = i + 1;
        const interactive = isInteractive && !pending;

        return (
          <div
            key={`${productId || "picker"}-star-${i}`}
            className={`relative ${interactive ? "cursor-pointer" : "cursor-default"}`}
            onMouseEnter={() => interactive && setHovered(starIndex)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => handleRate(starIndex)}
            onKeyDown={(e) => {
              if (!interactive) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRate(starIndex);
              }
            }}
            role={interactive ? "button" : "img"}
            aria-label={
              interactive
                ? `Rate ${starIndex} out of 5`
                : `Rating star ${starIndex} ${fill}`
            }
            tabIndex={interactive ? 0 : -1}
          >
            {/* Base empty star */}
            <Star size={size} className={`${emptyColor}`} strokeWidth={1.5} />

            {/* Overlay filled star */}
            {fill !== "empty" && (
              <Star
                size={size}
                className={`${hovered ? hoverColor : filledColor} absolute top-0 left-0`}
                fill="currentColor"
                strokeWidth={1.5}
                style={{
                  clipPath: fill === "half" ? "inset(0 50% 0 0)" : "none",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(StarRating);

// components/wishlist/WishlistButton.tsx
"use client";

import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import useWishlist from "@/hooks/useWishlist";
import type { Product } from "@/types/product";

type Props = { product: Product; className?: string; size?: number };

export default function WishlistButton({ product, className = "", size = 22 }: Props) {
  const { toggle, isWishlisted } = useWishlist();
  const active = isWishlisted(product.id);

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => toggle(product)}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`relative inline-flex items-center justify-center rounded-full p-2 transition hover:bg-gray-50 ${className}`}
    >
      {/* Glow effect when active */}
      {active && (
        <motion.span
          className="absolute inset-0 rounded-full bg-red-200"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      <motion.div
        key={active ? "active" : "inactive"}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <Heart
          size={size}
          className={`transition-colors ${
            active ? "text-red-500 fill-red-500 drop-shadow-md" : "text-gray-400"
          }`}
        />
      </motion.div>

      {/* Pulse animation when active */}
      {active && (
        <motion.span
          className="absolute"
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop" }}
        />
      )}
    </motion.button>
  );
}

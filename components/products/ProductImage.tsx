"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Props {
  image: string;
  name: string;
  isOffer?: boolean;
}

export default function ProductImage({ image, name, isOffer }: Props) {
  return (
    <motion.div
      className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg"
      whileHover={{ scale: 1.03 }}
    >
      <Image
        src={image || "/no-image.png"}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      {isOffer && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-red-600 text-white text-sm px-4 py-1 rounded-full shadow-lg">
          🔥 Limited Offer!
        </div>
      )}
    </motion.div>
  );
}

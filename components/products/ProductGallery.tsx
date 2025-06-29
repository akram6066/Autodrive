"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Dialog } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  name: string;
  isOffer?: boolean;
}

export default function ProductGallery({ images, name, isOffer }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setZoomOpen] = useState(false);
  const selectedImage = images[selectedIndex] || "/no-image.png";

  return (
    <div className="flex flex-col gap-6">
      {/* ✅ Main Image */}
      <motion.div
        key={selectedImage}
        className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => setZoomOpen(true)}
      >
        <Zoom>
          <Image
            src={selectedImage}
            alt={`${name} image ${selectedIndex + 1}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </Zoom>

        {isOffer && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-red-600 text-white text-sm px-4 py-1 rounded-full shadow-lg">
            🔥 Limited Offer!
          </div>
        )}
      </motion.div>

      {/* ✅ Zoom Dialog */}
      {isZoomOpen && (
        <Dialog open={isZoomOpen} onOpenChange={setZoomOpen}>
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 text-white hover:text-red-500"
              onClick={() => setZoomOpen(false)}
              aria-label="Close zoom"
            >
              <X size={28} />
            </button>

            <div className="relative w-full max-w-4xl h-[80vh]">
              <Image
                src={selectedImage}
                alt={`${name} fullscreen image`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* ✅ Thumbnails */}
      <div className="flex gap-3 justify-center overflow-x-auto pb-2">
        {images.map((img, index) => (
          <button
            type="button"
            key={index}
            className={`relative min-w-[96px] h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              index === selectedIndex ? "border-primary scale-105" : "border-gray-200 hover:scale-105"
            }`}
            onClick={() => setSelectedIndex(index)}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={img}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              loading="lazy"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* ✅ Image Count */}
      <p className="text-center text-sm text-muted-foreground">
        Image {selectedIndex + 1} of {images.length}
      </p>
    </div>
  );
}

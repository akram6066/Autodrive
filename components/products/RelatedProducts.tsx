"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface BrandSize {
  size: string;
  price: number;
}

interface Brand {
  brandName: string;
  sizes: BrandSize[];
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: Category;
  description: string;
  quantity: number;
  brands: Brand[];
  images: string[];
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
}

export default function RelatedProducts({ slug }: { slug: string }) {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/products/related/${slug}`);
        const data = await res.json();

        // ✅ Fix API response shape
        setRelated(data.relatedProducts ?? []);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [slug]);

  if (loading) {
    return (
      <div className="mt-24 text-center text-gray-500 animate-pulse">
        Loading related products...
      </div>
    );
  }

  if (related.length === 0) {
    return (
      <div className="mt-24 text-center text-gray-400">
        No related products found.
      </div>
    );
  }

  return (
    <section className="mt-24">
      <h2 className="text-3xl font-extrabold text-primary mb-8">
        Related Products
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {related.map((product, index) => {
          const firstImage = product.images?.[0] || "/no-image.png";

          const firstBrand = product.brands?.[0];
          const firstSize = firstBrand?.sizes?.[0];
          const price = product.discountPrice ?? firstSize?.price ?? 0;

          return (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={`View ${product.name}`}
            >
              <article>
                <div className="relative w-full h-64">
                  <Image
                    src={firstImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    priority={index === 0}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {product.category.name}
                  </p>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < (product.rating ?? 4)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                        fill={i < (product.rating ?? 4) ? "yellow" : "none"}
                      />
                    ))}
                  </div>

                  <div className="text-xl font-semibold text-primary">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(price)}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton"; // ✅ Global shimmer loader

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/admin/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="max-w-7xl mx-auto py-20 px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-16">
        Browse Our Categories
      </h2>

      {loading ? (
        <LoadingSkeleton type="grid" count={6} columns={3} height={240} />
      ) : error ? (
        <div className="bg-red-100 text-red-700 text-center p-4 rounded-xl shadow-sm">
          {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-700 text-center p-4 rounded-xl shadow-sm">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products/category/${category.slug}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-transform hover:scale-105"
            >
              <div className="relative w-full h-60">
                <Image
                  src={category.image || "/default-category.jpg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110 rounded-t-2xl"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 text-center text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

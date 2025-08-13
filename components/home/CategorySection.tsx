"use client";

import Image from "next/image";
import Link from "next/link";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import useSWR from "swr";

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export default function CategorySection() {
  const { data: categories, error, isLoading, mutate } = useSWR<CategoryType[]>(
    "/api/admin/categories",
    fetcher,
    { revalidateOnFocus: false }
  );

  return (
    <section className="max-w-7xl mx-auto py-20 px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-16">
        Browse Our Categories
      </h2>

      {isLoading ? (
        <LoadingSkeleton type="grid" count={6} columns={3} height={240} />
      ) : error ? (
        <div className="bg-red-100 text-red-700 text-center p-4 rounded-xl shadow-sm">
          <p>Failed to load categories.</p>
          <button
            onClick={() => mutate()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      ) : !categories?.length ? (
        <div className="bg-yellow-100 text-yellow-700 text-center p-4 rounded-xl shadow-sm">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <Link
              key={category._id}
              href={`/products/category/${category.slug}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="relative w-full h-60">
                <Image
                  src={category.image || "/default-category.jpg"}
                  alt={`${category.name} category`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110 rounded-t-2xl"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={idx < 3} // Load top-row images faster
                  loading={idx < 3 ? "eager" : "lazy"}
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductsFilters from "@/components/products/ProductsFilters";
import ProductCard from "@/components/products/ProductCard";
import ProductsPagination from "@/components/products/ProductsPagination";
import SkeletonProductGrid from "@/components/SkeletonProductGrid";
import { Product } from "@/types/product";

interface ProductsResponse {
  total: number;
  products: Product[];
}

interface RatingsMap {
  [productId: string]: number;
}

export default function ProductsClientPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [ratings, setRatings] = useState<RatingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize query string so it doesn't trigger extra renders
  const searchString = useMemo(() => searchParams.toString(), [searchParams]);
  const page = Number(searchParams.get("page") ?? 1);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProductsAndRatings = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1️⃣ Fetch products first
        const res = await fetch(`/api/products?${searchString}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch products");

        const json: ProductsResponse = await res.json();

        // Filter out products without valid brand/size
        const validProducts = json.products.filter(
          (p) => p.brands?.length > 0 && p.brands.every((b) => b.sizes?.length > 0)
        );

        setData({ total: json.total, products: validProducts });

        // 2️⃣ Bulk fetch ratings for only the visible products
        if (validProducts.length > 0) {
          const ids = validProducts.map((p) => p._id).join(",");
          const ratingsRes = await fetch(`/api/reviews/stats?ids=${ids}`, {
            signal: controller.signal,
          });
          if (ratingsRes.ok) {
            const ratingsData: RatingsMap = await ratingsRes.json();
            setRatings(ratingsData);
          } else {
            setRatings({});
          }
        } else {
          setRatings({});
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndRatings();

    return () => {
      controller.abort(); // Cancel if search changes quickly
    };
  }, [searchString]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-center text-primary mb-14">
        Explore Our Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Filters */}
        <div>
          <ProductsFilters />
        </div>

        {/* Product List + Pagination */}
        <div className="md:col-span-3">
          {loading ? (
            <SkeletonProductGrid count={12} />
          ) : error ? (
            <div className="text-center text-red-500 py-24">❌ {error}</div>
          ) : data && data.products.length === 0 ? (
            <div className="text-center text-lg text-red-500 py-24">🚫 No products found!</div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.products.map((product) => (
                  <ProductCard
                    key={`${product._id}-${product.slug}`}
                    product={product}
                    averageRating={ratings[product._id] || 0}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data && data.total > 12 && (
                <div className="mt-12">
                  <ProductsPagination total={data.total} currentPage={page} pageSize={12} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

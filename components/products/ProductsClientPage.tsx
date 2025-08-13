"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProductsFilters from "@/components/products/ProductsFilters";
import ProductCard from "@/components/products/ProductCard";
import ProductsPagination from "@/components/products/ProductsPagination";
import SkeletonProductGrid from "@/components/SkeletonProductGrid";

interface BrandSize {
  size: string;
  price: number;
}

interface Brand {
  brandName: string;
  sizes: BrandSize[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category | null;
  description: string;
  quantity: number;
  brands: Brand[];
  image?: string;
  discountPrice?: number;
  isOffer?: boolean;
}

interface ProductsResponse {
  total: number;
  products: Array<Product & { _id?: string }>;
}

export default function ProductsClientPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize query string and page to avoid unnecessary re-renders
  const searchString = useMemo(() => searchParams.toString(), [searchParams]);
  const page = useMemo(() => Number(searchParams.get("page") ?? 1), [searchParams]);

  // Fetch products with abortable fetch
  const fetchProducts = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products?${searchString}`, { signal });
      if (!res.ok) throw new Error("Failed to fetch products");

      const json: ProductsResponse = await res.json();

      // Map _id to id and ensure valid brands/sizes
      const validProducts = json.products
        .filter((p) => p.brands?.length > 0 && p.brands.every((b) => b.sizes?.length > 0))
        .map((p) => ({
          ...p,
          id: p._id || p.id || "", // Map _id to id, fallback to empty string
          category: p.category && "id" in p.category && "name" in p.category && "slug" in p.category
            ? p.category // Ensure category is a valid Category object
            : null, // Fallback to null if category is not populated or invalid
        }));

      setData({ total: json.total, products: validProducts });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchString]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-center text-primary mb-14">
        Explore Our Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
        {/* Filters */}
        <aside className="md:sticky md:top-24">
          <ProductsFilters />
        </aside>

        {/* Product List + Pagination */}
        <section className="md:col-span-3 space-y-8">
          {loading ? (
            <SkeletonProductGrid count={12} />
          ) : error ? (
            <div className="text-center text-red-500 py-24 bg-white rounded-2xl shadow-lg">
              ❌ {error}
            </div>
          ) : data && data.products.length === 0 ? (
            <div className="text-center text-lg text-red-500 py-24 bg-white rounded-2xl shadow-lg">
              🚫 No products found!
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {data?.products.map((product) => (
                  <ProductCard
                    key={`${product.id}-${product.slug}`}
                    product={product}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data && data.total > 12 && (
                <ProductsPagination
                  total={data.total}
                  currentPage={page}
                  pageSize={12}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
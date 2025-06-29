// app/products/page.tsx

import ProductsFilters from "@/components/products/ProductsFilters";
import ProductCard from "@/components/products/ProductCard";
import ProductsPagination from "@/components/products/ProductsPagination";
import { absoluteFetch } from "@/lib/absoluteFetch";
import { Metadata } from "next";
import { Product } from "@/types/product";

interface ProductsResponse {
  total: number;
  products: Product[];
}

export const metadata: Metadata = {
  title: "Browse Products | AutoDrive",
  description: "Find the best products with filtering, pricing, brands and more.",
  openGraph: {
    title: "Browse Products | AutoDrive",
    description: "Find the best products with filtering, pricing, brands and more.",
    url: "https://yourdomain.com/products",
    siteName: "AutoDrive",
    type: "website",
  },
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const paramsObj = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(paramsObj)) {
    if (typeof value === "string") {
      params.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v === "string") {
          params.append(key, v);
        }
      });
    }
  }

  const pageParam = params.get("page");
  const page = pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : 1;

  let data: ProductsResponse;

  try {
    data = await absoluteFetch<ProductsResponse>(`/api/products?${params.toString()}`, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return (
      <div className="text-center text-red-500 py-24">
        ❌ Error fetching products. Please try again later.
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-center text-primary mb-14">
        Explore Our Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <ProductsFilters />
        </div>

        <div className="md:col-span-3">
          {data.products.length === 0 ? (
            <div className="text-center text-lg text-red-500 py-24">
              🚫 No products found!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.products.map((product) => (
                <ProductCard key={`${product._id}-${product.slug}`} product={product} />
              ))}
            </div>
          )}

          <div className="mt-12">
            <ProductsPagination total={data.total} currentPage={page} pageSize={12} />
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { absoluteFetch } from "@/lib/absoluteFetch";
import ProductCard, { Product } from "@/components/products/ProductCard";

interface ApiResponse {
  products: Product[];
}

export default async function FeaturedProducts() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    const data: ApiResponse = await absoluteFetch(
      "/api/products?limit=6&fields=id,slug,name,category,description,quantity,brands,image,discountPrice,isOffer",
      { next: { revalidate: 60 } }
    );
    products = data.products;
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
    error = "Unable to load featured products.";
  }

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="max-w-7xl mx-auto px-4 py-20"
    >
      <div className="flex flex-col items-center mb-14">
        <h2
          id="featured-products-heading"
          className="text-3xl md:text-4xl font-bold text-center text-primary"
        >
          Featured Products
        </h2>

        {!error && products.length > 0 && (
          <Link
            href="/products"
            className="mt-4 text-sm text-orange-600 font-medium hover:underline hover:underline-offset-4 transition-colors"
          >
            Browse all products →
          </Link>
        )}
      </div>

      {error ? (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          <p>{error}</p>
          <Link
            href="/products"
            className="inline-block mt-3 text-sm font-medium text-red-600 hover:underline hover:underline-offset-4"
          >
            Browse all products →
          </Link>
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          No featured products available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

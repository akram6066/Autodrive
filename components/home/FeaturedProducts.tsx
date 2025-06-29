import Link from "next/link";
import { absoluteFetch } from "@/lib/absoluteFetch";
import ProductCard, { Product } from "@/components/products/ProductCard";

// Server Component (pure async server component)
export default async function FeaturedProducts() {
  // ✅ Fully type-safe fetch — you get Product[] directly
  const allProducts = await absoluteFetch<Product[]>("/api/admin/products", {
    next: { revalidate: 60 }, // ✅ ISR: cache for 60 seconds
  });

  const featured = allProducts.slice(0, 6); // ✅ Take first 6 products only

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-14">
        Featured Products
      </h2>

      {featured.length === 0 ? (
        <p className="text-center text-gray-500">
          No featured products available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <div className="text-center mt-14">
        <Link href="/products">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow transition">
            View All Products
          </button>
        </Link>
      </div>
    </section>
  );
}

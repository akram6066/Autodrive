import Link from "next/link";
import { absoluteFetch } from "@/lib/absoluteFetch";
import ProductCard, { Product } from "@/components/products/ProductCard";

export default async function FeaturedProducts() {
  // Properly typed fetch
  const { products }: { products: (Omit<Product, "_id"> & { id: string })[] } = await absoluteFetch(
    "/api/products",
    {
      next: { revalidate: 60 },
    }
  );

  // Convert id → _id for compatibility with ProductCard
  const mapped: Product[] = products.map((p) => ({
    ...p,
    _id: p.id, // 👈 Fix: map id to _id
  }));

  const featured = mapped.slice(0, 6);

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

import Link from "next/link";
import ProductCard, { Product } from "@/components/products/ProductCard";
import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/models/ProductType";

// Minimal lean types
type LeanCategory = { _id?: string | { toString(): string }; name: string; slug: string; image?: string };
type LeanSize = { _id?: string | { toString(): string }; size: string; price: number };
type LeanBrand = { _id?: string | { toString(): string }; brandName: string; sizes: LeanSize[] };
type LeanProduct = {
  _id: string | { toString(): string };
  slug: string;
  name: string;
  category: LeanCategory;
  description: string;
  quantity: number;
  brands: LeanBrand[];
  image: string;
  images?: string[];
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
};

// ✅ Always return a proper `Product`
function serializeProduct(doc: LeanProduct): Product {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    quantity: doc.quantity,
    image: doc.image,
    images: doc.images ?? [],
    discountPrice: doc.discountPrice,
    isOffer: doc.isOffer,
    rating: doc.rating,

    category: {
      ...doc.category,
      id: doc.category._id?.toString() ?? "",
    },

    brands: doc.brands?.map((b) => ({
      ...b,
      _id: b._id?.toString() ?? "",
      sizes: b.sizes?.map((s) => ({
        ...s,
        _id: s._id?.toString() ?? "",
      })) ?? [],
    })) ?? [],
  };
}

export default async function FeaturedProducts() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    await dbConnect();
    const result = await ProductModel.find(
      {},
      "slug name category description quantity brands image discountPrice isOffer rating"
    )
      .limit(6)
      .lean();

    // ✅ Safe conversion
    const plain = JSON.parse(JSON.stringify(result)) as LeanProduct[];
    products = plain.map(serializeProduct);
  } catch (err) {
    console.error("Failed to load featured products:", err);
    error = "Unable to load featured products.";
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col items-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary">
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

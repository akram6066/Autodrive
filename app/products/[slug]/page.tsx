import { notFound } from "next/navigation";
import { absoluteFetch } from "@/lib/absoluteFetch";
import ProductGallery from "@/components/products/ProductGallery";
import ProductTabs from "@/components/products/ProductTabs";
import AddToCartButton from "@/components/products/AddToCartButton";
import { Heart, Share2, Truck, RotateCcw, Star } from "lucide-react";
import { formatPrice } from "@/utils/price";
import type { Product } from "@/types/product";
import type { Metadata } from "next";

// ✅ Fetch product
async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    return await absoluteFetch<Product>(`/api/admin/products/slug/${slug}`);
  } catch {
    return null;
  }
}

// ✅ SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | AutoDrive`,
    description: product.description,
    openGraph: {
      images: [{ url: product.image || "/no-image.png" }],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return notFound();

  const originalPrice = product.brands?.[0]?.sizes?.[0]?.price ?? 0;
  const discount = product.discountPrice ?? originalPrice;
  const discountPercent =
    originalPrice > 0 ? ((originalPrice - discount) / originalPrice) * 100 : 0;
  const rating = product.rating ?? 4.5;
  const galleryImages = product.images?.length ? product.images : [product.image];

  return (
    <main className="max-w-7xl mx-auto py-16 px-4">
      <section className="grid md:grid-cols-2 gap-10">
        <ProductGallery images={galleryImages} name={product.name} isOffer={product.isOffer} />

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-primary mb-4">{product.name}</h1>

            <div className="flex items-center mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={24} className={i + 1 <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"} fill={i + 1 <= Math.round(rating) ? "yellow" : "none"} />
              ))}
              <span className="ml-2 text-sm text-gray-500">({rating.toFixed(1)} rating)</span>
            </div>

            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <span>Category:</span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{product.category.name}</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-red-600">{formatPrice(discount)}</span>
                  <span className="text-lg line-through text-gray-400">{formatPrice(originalPrice)}</span>
                  <span className="text-green-600 font-semibold text-sm">({Math.round(discountPercent)}% OFF)</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-black">{formatPrice(originalPrice)}</span>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-2 text-lg">Available Sizes:</h3>
              <div className="flex flex-wrap gap-3">
                {product.brands[0]?.sizes.map((size, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                    {size.size} - {formatPrice(size.price)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <AddToCartButton product={product} />
              <button className="border border-gray-300 text-primary p-3 rounded-xl hover:scale-105"><Heart /></button>
              <button className="border border-gray-300 text-primary p-3 rounded-xl hover:scale-105"><Share2 /></button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-3"><Truck /> Free Shipping over KSh 100,000</div>
            <div className="flex items-center gap-3"><RotateCcw /> 30-Day Return Guarantee</div>
          </div>
        </div>
      </section>

      <ProductTabs description={product.description} />
    </main>
  );
}

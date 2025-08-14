import { Suspense } from "react";
import { notFound } from "next/navigation";
import { absoluteFetch } from "@/lib/absoluteFetch";
import type { Product } from "@/types/product";
import type { Metadata } from "next";
import ProductDetailSkeleton from "@/components/skeleton/ProductDetailSkeleton";
import ProductDetailClient from "@/components/products/ProductDetailClient";

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    return await absoluteFetch<Product>(`/api/product/slug/${slug}`);
  } catch {
    return null;
  }
}

// ✅ Await params in Next.js 15+
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params; // ✅ destructure after awaiting
  const product = await fetchProduct(slug);

  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | AutoDrive`,
    description: product.description,
    openGraph: { images: [{ url: product.image || "/no-image.png" }] },
  };
}

export default async function ProductDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params; // ✅ same here
  const product = await fetchProduct(slug);

  if (!product) return notFound();

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailClient product={product} />
    </Suspense>
  );
}

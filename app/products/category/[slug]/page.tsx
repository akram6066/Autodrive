import { notFound } from "next/navigation";
import ProductCard, { Product as ProductCardType } from "@/components/products/ProductCard";
import { absoluteFetch } from "@/lib/absoluteFetch";
import type { Metadata } from "next";

// Types from API
interface BrandSize {
  size: string;
  price: number;
}

interface Brand {
  brandName: string;
  sizes: BrandSize[];
}

interface CategoryFromAPI {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface ProductFromAPI {
  _id: string;
  slug: string;
  name: string;
  category: CategoryFromAPI;
  description: string;
  quantity: number;
  brands: Brand[];
  image?: string;
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
}

// -------- Fetch functions --------
async function getCategoryBySlug(slug: string): Promise<CategoryFromAPI | null> {
  try {
    return await absoluteFetch<CategoryFromAPI>(`/api/categories/slug/${slug}`, {
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

async function getProductsByCategoryId(categoryId: string): Promise<ProductFromAPI[]> {
  try {
    return await absoluteFetch<ProductFromAPI[]>(`/api/products/category/${categoryId}`, {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }
}

// -------- Metadata for SEO --------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | AutoDrive",
      description: "Requested category not found.",
    };
  }

  return {
    title: `${category.name} | AutoDrive`,
    description: `Explore top-quality products under ${category.name}.`,
    openGraph: {
      images: [
        {
          url: category.image || "/no-image.png",
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

// -------- Page Component --------
export default async function ProductsByCategory({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategoryId(category._id);

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-10 text-primary text-center">
        {category.name}
      </h1>

      {products.length === 0 ? (
        <div className="text-center text-xl text-gray-500 py-24">
          🚫 No products available in {category.name} category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => {
            const productForCard: ProductCardType = {
              ...product,
              id: product._id, // ✅ map _id → id for ProductCard
              category: product.category
                ? {
                    id: product.category._id, // ✅ map _id → id for category
                    name: product.category.name,
                    slug: product.category.slug,
                  }
                : null,
            };
            return <ProductCard key={product._id} product={productForCard} />;
          })}
        </div>
      )}
    </div>
  );
}

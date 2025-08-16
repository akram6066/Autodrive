// lib/serializers/product.ts
import { Product, Brand, BrandSize, Category } from "@/types/product";

// Shape of a lean Mongoose document (after .lean())
export interface ProductDoc {
  _id: string | { toString(): string };
  name: string;
  slug: string;
  description: string;
  quantity: number;
  image: string;
  images?: string[];
  discountPrice?: number | null;
  isOffer?: boolean;
  rating?: number | null;
  category?: {
    _id: string | { toString(): string };
    name: string;
    slug: string;
    image?: string | null;
  } | null;
  brands?: {
    _id?: string | { toString(): string };
    brandName: string;
    sizes?: {
      _id?: string | { toString(): string };
      size: string;
      price: number;
    }[];
  }[];
}

// 🔥 Serialize a single product document
export function serializeProduct(doc: ProductDoc): Product {
  return {
    id: typeof doc._id === "string" ? doc._id : doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    quantity: doc.quantity,
    image: doc.image,
    images: doc.images ?? [],
    discountPrice: doc.discountPrice ?? undefined,
    isOffer: doc.isOffer ?? false,
    rating: doc.rating ?? undefined,
    brands:
      doc.brands?.map(
        (b): Brand => ({
          brandName: b.brandName,
          sizes:
            b.sizes?.map(
              (s): BrandSize => ({
                size: s.size,
                price: s.price,
              })
            ) ?? [],
        })
      ) ?? [],
    category: doc.category
      ? ({
          id:
            typeof doc.category._id === "string"
              ? doc.category._id
              : doc.category._id.toString(),
          name: doc.category.name,
          slug: doc.category.slug,
          image: doc.category.image ?? undefined,
        } satisfies Category)
      : null,
  };
}

// 🔥 Serialize an array of products
export function serializeProducts(docs: ProductDoc[]): Product[] {
  return docs.map(serializeProduct);
}

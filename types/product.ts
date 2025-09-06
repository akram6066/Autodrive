

// Brand & Size
export interface BrandSize {
  size: string;
  price: number;
}

export interface Brand {
  brandName: string;
  sizes: BrandSize[];
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

// Product from DB (raw Mongoose document)
export interface ProductDb {
  _id: string;
  slug: string;
  name: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
  };
  description: string;
  quantity: number;
  brands: {
    _id: string;
    brandName: string;
    sizes: { _id: string; size: string; price: number }[];
  }[];
  image: string;
  images?: string[]; // ✅ keep optional array
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
}

// Product for client / API response
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category | null;
  description: string;
  quantity: number;
  brands: Brand[];
  image: string;       // main image
  images?: string[];   // ✅ optional gallery images
  discountPrice?: number | null;
  isOffer?: boolean;
  rating?: number;
}

// API response
export interface ProductsApiResponse {
  total: number;
  products: Product[];
}

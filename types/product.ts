export interface BrandSize {
  size: string;
  price: number;
}

export interface Brand {
  brandName: string;
  sizes: BrandSize[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  quantity: number;
  brands: Brand[];
  image: string;
  images?: string[];
  discountPrice?: number;
  isOffer?: boolean;
  rating?: number;
}

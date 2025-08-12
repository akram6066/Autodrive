// types/review.ts
export interface Product {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  name: string;
}

export interface Review {
  _id: string;
  product: Product;
  user: User;
  rating: number;
  comment: string;
  createdAt: string;
}

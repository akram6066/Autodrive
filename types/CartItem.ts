// types/CartItem.ts

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  image: string;
  variant: {
    brand: string;
    size: string;
  };
  quantity: number;
}

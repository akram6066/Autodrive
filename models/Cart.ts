import { Schema, Document, models, model } from "mongoose";

export interface ICartItem extends Document {
  userId: string;
  productId: string;
  productName: string;
  image: string;
  variant: string;
  price: number;
  discountPrice: number;
  quantity: number;
  addedAt: Date;
}

const CartSchema = new Schema<ICartItem>(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    image: { type: String, required: true },
    variant: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Cart || model<ICartItem>("Cart", CartSchema);

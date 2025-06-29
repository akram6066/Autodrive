import mongoose, { Schema, Document, Types } from "mongoose";

interface Size {
  size: string;
  price: number;
}

interface Brand {
  brandName: string;
  sizes: Size[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;  // ✅ ADD slug field
  category: Types.ObjectId;
  description: string;
  quantity: number;
  image: string;
  brands: Brand[];
  discountPrice?: number;
  isOffer?: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },  // ✅ ADD slug schema
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    brands: [
      {
        brandName: String,
        sizes: [
          {
            size: String,
            price: Number,
          },
        ],
      },
    ],
    discountPrice: { type: Number, default: null },
    isOffer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

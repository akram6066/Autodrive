import mongoose, { Schema, Document } from "mongoose";

export interface ReviewType extends Document {
  product: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<ReviewType>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model<ReviewType>("Review", ReviewSchema);

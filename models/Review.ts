import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

/**
 * 🔹 Indexing Strategy for High Performance
 * - Unique index on (user, product) → prevents duplicate reviews by the same user.
 * - Index on product → speeds up product review lookups & aggregations.
 * - Index on rating → optional, useful for sorting/filtering by rating.
 */
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
ReviewSchema.index({ product: 1 });
ReviewSchema.index({ rating: 1 });

const ReviewModel: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default ReviewModel;

// ✅ Export interface for type safety
export type { IReview as ReviewDocument };

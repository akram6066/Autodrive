import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId; 
  product: Types.ObjectId; 
  rating: number; 
  comment?: string; // 🔹 optional now
  badge?: string;  
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },

    // 🔹 Optional comment (no required:true)
    comment: { type: String, trim: true },

    badge: {
      type: String,
      enum: ["Verified Buyer", "Top Reviewer", "New User", "Helpful Reviewer"],
      default: "New User",
    },
  },
  { timestamps: true }
);

// Indexing
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
ReviewSchema.index({ product: 1 });
ReviewSchema.index({ rating: 1 });

const ReviewModel: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default ReviewModel;
export type { IReview as ReviewDocument };

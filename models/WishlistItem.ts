// models/Wishlist.ts
import mongoose, { Document, Model } from "mongoose";

export interface IWishlistDoc extends Document {
  user?: mongoose.Types.ObjectId;      // optional for guest
  guestId?: string;                     // added for guest
  productId: mongoose.Types.ObjectId;
  snapshot?: {
    id: string;
    name: string;
    image: string;
    discountPrice?: number;
  };
  createdAt: Date;
}

const WishlistSchema = new mongoose.Schema<IWishlistDoc>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  guestId: { type: String, required: false }, // track guest
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  snapshot: {
    id: String,
    name: String,
    image: String,
    discountPrice: Number,
  },
  createdAt: { type: Date, default: () => new Date() },
});

// Add a compound unique index to prevent duplicates for user/guest
WishlistSchema.index(
  { user: 1, guestId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { productId: { $exists: true } } }
);

const Wishlist: Model<IWishlistDoc> =
  (mongoose.models.Wishlist as Model<IWishlistDoc>) ||
  mongoose.model<IWishlistDoc>("Wishlist", WishlistSchema);

export default Wishlist;

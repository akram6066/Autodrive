import mongoose, { Schema, Document, Types } from "mongoose";

interface OrderItem {
  name: string;
  variant: string;
  quantity: number;
  price: number;
  discountApplied: boolean;
  subtotal: number;
  image?: string; // Added image field
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  userEmail?: string;
  userName?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  phone: string;
  address: string;
  paymentMethod: "mpesa" | "cod";
  status: "pending" | "unpaid" | "paid" | "cancelled" | "shipped";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  name: String,
  variant: String,
  quantity: Number,
  price: Number,
  discountApplied: Boolean,
  subtotal: Number,
  image: { type: String, required: false }, // Optional image field
});

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String },
    userName: { type: String },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ["mpesa", "cod"], required: true },
    status: {
      type: String,
      enum: ["pending", "unpaid", "paid", "cancelled", "shipped"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
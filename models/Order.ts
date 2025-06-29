// ✅ /models/Order.ts (Updated Model)
import mongoose, { Schema, Document } from "mongoose";

interface OrderItem {
  name: string;
  variant: string;
  quantity: number;
  price: number;
  discountApplied: boolean;
  subtotal: number;
}

export interface IOrder extends Document {
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

const OrderItemSchema: Schema = new Schema({
  name: String,
  variant: String,
  quantity: Number,
  price: Number,
  discountApplied: Boolean,
  subtotal: Number,
});

const OrderSchema: Schema = new Schema(
  {
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

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

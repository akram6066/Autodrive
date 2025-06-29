import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Order from "@/models/Order";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  image: string;
  variant: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  await connectDB();

  const {
    items,
    subtotal,
    total,
    phone,
    address,
    paymentMethod,
  }: {
    items: CartItem[];
    subtotal: number;
    total: number;
    phone: string;
    address: string;
    paymentMethod: "mpesa" | "cod";
  } = await req.json();

  if (!items || !subtotal || !total || !phone || !address || !paymentMethod) {
    return NextResponse.json({ error: "Missing order data" }, { status: 400 });
  }

  const cleanedItems = items.map((item) => {
    const actualPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
    return {
      name: item.name,
      variant: item.variant,
      quantity: item.quantity,
      price: actualPrice,
      discountApplied: item.discountPrice > 0,
      subtotal: actualPrice * item.quantity,
    };
  });

  const newOrder = await Order.create({
    items: cleanedItems,
    subtotal,
    total,
    phone,
    address,
    paymentMethod,
    status: paymentMethod === "cod" ? "pending" : "unpaid",
  });

  return NextResponse.json({ orderId: newOrder._id });
}

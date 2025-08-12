// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/dbConnect";
import Order from "@/models/Order";


export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await Order.find()
      .populate("user", "name email") // show user's name & email
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("Admin fetch orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

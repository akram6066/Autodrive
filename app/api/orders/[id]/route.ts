import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Order, { IOrder } from "@/models/Order";
import { Types } from "mongoose";

// ✅ Updated type for Next.js 15 - params is now a Promise
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    // 1️⃣ Connect to database
    await dbConnect();
    
    // 2️⃣ Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Await params in Next.js 15
    const { id } = await context.params;
    
    // 4️⃣ Validate order ID format
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
    }

    // 5️⃣ Fetch order with lean query for performance
    const order = await Order.findById(id)
      .populate("user", "name email")
      .lean<IOrder>();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 6️⃣ Authorization: admin or owner can view
    const isAdmin = session.user.role === "admin";
    const isOwner = order.userEmail === session.user.email;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 7️⃣ Success
    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error("Error fetching order:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
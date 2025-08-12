import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Order, { IOrder } from "@/models/Order";
import { Types } from "mongoose";

// Define params type for better TypeScript safety
interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(req: Request, context: RouteContext) {
  try {
    // Connect to database
    await dbConnect();

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Await params to handle Next.js dynamic route correctly
    const params = 'params' in context ? await context.params : context;
    const { id } = params;

    // Validate order ID
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
    }

    // Fetch order with lean for performance
    const order = await Order.findById(id)
      .populate("user", "name email")
      .lean<IOrder>();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check authorization
    const isAdmin = session.user.role === "admin";
    const isOwner = order.userEmail === session.user.email;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error("Error fetching order:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Explicitly export only GET to prevent 405 errors
// export { GET }; // Removed to prevent redeclaration error
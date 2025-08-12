import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Correctly extract userId from URL using req.nextUrl
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const userId = segments[segments.length - 1]; // last segment

  try {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json({ error: "Failed to fetch user orders" }, { status: 500 });
  }
}

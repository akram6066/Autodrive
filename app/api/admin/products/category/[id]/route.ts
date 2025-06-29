import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  await dbConnect();

  const { id } = await context.params;  // ✅ await the params

  try {
    const products = await Product.find({ category: id }).populate("category");
    return NextResponse.json(products);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

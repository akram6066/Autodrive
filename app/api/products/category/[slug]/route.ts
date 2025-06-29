import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  await dbConnect();

  try {
    const product = await Product.findOne({ slug: params.slug }).populate("category");
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error("Error fetching product by slug:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

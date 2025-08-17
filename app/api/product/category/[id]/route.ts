import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/ProductType";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } } // just plain object
) {
  await dbConnect();

  const { id } = params; // no "await"

  try {
    const products = await Product.find({ category: id }).populate("category");
    return NextResponse.json(products);
  } catch (err) {
    console.error("❌ Error fetching products by category:", err);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

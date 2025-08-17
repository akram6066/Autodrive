import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/ProductType";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }  // ✅ plain object, not Promise
) {
  await dbConnect();

  const { id } = context.params; // ✅ must use `context.params`

  try {
    const products = await Product.find({ category: id }).populate("category");
    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching products by category:", err);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/ProductType";

/**
 * GET /api/product/category/[id]
 * Fetch all products belonging to a category
 */
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    // Ensure DB connection before any query
    await dbConnect();

    // Fetch products by category
    const products = await Product.find({ category: id }).populate("category");

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No products found for this category." },
        { status: 404 }
      );
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching products by category:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products. Please try again later.",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

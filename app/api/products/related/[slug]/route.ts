import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // Type params as Promise
) {
  await dbConnect();

  const { slug } = await params; // Await params to resolve the Promise

  try {
    const product = await Product.findOne({ slug }).populate("category");

    if (!product) {
      // Instead of 404, return empty related list
      return NextResponse.json({
        message: "Product not found",
        relatedProducts: [],
      });
    }

    const relatedProducts = await Product.find({
      category: product.category._id,
      slug: { $ne: slug },
    })
      .limit(6)
      .populate("category")
      .select("_id name slug images image discountPrice brands category rating");

    return NextResponse.json({
      relatedProducts,
    });
  } catch (err: unknown) {
    console.error("Error fetching related products:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
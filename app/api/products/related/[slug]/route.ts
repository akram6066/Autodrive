import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  await dbConnect();
  const { slug } = context.params;

  try {
    const product = await Product.findOne({ slug }).populate("category");

    if (!product) {
      // Instead of 404, return empty related list
      return NextResponse.json({
        message: "Product not found",
        relatedProducts: []
      });
    }

    const relatedProducts = await Product.find({
      category: product.category._id,
      slug: { $ne: slug }
    })
      .limit(6)
      .populate("category")
      .select("_id name slug images image discountPrice brands category rating");

    return NextResponse.json({
      relatedProducts
    });
  } catch (err) {
    console.error("Error fetching related products:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

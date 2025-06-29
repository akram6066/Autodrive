import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/Product";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { productId, userId, rating, comment } = await req.json();

    if (!productId || !userId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await Review.create({
      product: productId,
      user: userId,
      rating,
      comment,
    });

    // After review created, update product average rating
    const reviews = await Review.find({ product: productId });
    const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, { averageRating: average });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

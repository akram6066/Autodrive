import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";

interface RouteParams {
  params: Promise<{ productId: string }>; // ✅ params is now async in Next.js 15+
}

type ReviewStatsResponse = {
  averageRating: number;
  totalReviews: number;
};

export async function GET(_: Request, context: RouteParams) {
  // ✅ Await the params before destructuring
  const { productId } = await context.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  await dbConnect();

  // Aggregate stats
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  // No reviews case
  if (stats.length === 0) {
    return NextResponse.json<ReviewStatsResponse>({
      averageRating: 0,
      totalReviews: 0,
    });
  }

  // Return stats with 1 decimal place for average
  return NextResponse.json<ReviewStatsResponse>({
    averageRating: Number(stats[0].averageRating.toFixed(1)),
    totalReviews: stats[0].totalReviews,
  });
}

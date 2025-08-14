import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";

// ✅ GET handler for product review stats
export async function GET(
  _request: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params; // ✅ Await params in Next.js 15

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    // ✅ Connect to MongoDB (cached)
    await dbConnect();

    // ✅ Fast aggregation with index usage
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingsBreakdown: {
            $push: "$rating"
          }
        }
      }
    ]);

    if (!stats.length) {
      return NextResponse.json(
        { averageRating: 0, totalReviews: 0, ratingsBreakdown: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(stats[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch review stats" },
      { status: 500 }
    );
  }
}

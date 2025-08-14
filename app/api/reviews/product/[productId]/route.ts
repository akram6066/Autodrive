import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";

/**
 * GET /api/reviews/product/[id]/stats
 * Returns aggregated review stats for a product
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id: productId } = params;

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    // ✅ Cached DB connection
    await dbConnect();

    // ✅ Use aggregation for fast stats
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingsCount: {
            $push: "$rating",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 1] }, // Round to 1 decimal
          ratingBreakdown: {
            $arrayToObject: {
              $map: {
                input: [1, 2, 3, 4, 5],
                as: "star",
                in: [
                  { $toString: "$$star" },
                  {
                    $size: {
                      $filter: {
                        input: "$ratingsCount",
                        as: "r",
                        cond: { $eq: ["$$r", "$$star"] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json(stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      ratingBreakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    });

  } catch (error) {
    console.error("❌ Error fetching review stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch review stats" },
      { status: 500 }
    );
  }
}

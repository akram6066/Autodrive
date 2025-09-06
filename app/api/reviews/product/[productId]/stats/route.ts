// app/api/reviews/product/[productId]/stats/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";

export const runtime = "nodejs";

type ReviewStatsResponse = {
  averageRating: number;
  totalReviews: number;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  await dbConnect();

  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]).option({ lean: true });

  const response: ReviewStatsResponse = {
    averageRating: stats?.averageRating ? Number(stats.averageRating.toFixed(1)) : 0,
    totalReviews: stats?.totalReviews ?? 0,
  };

  return NextResponse.json(response, { status: 200 });
}

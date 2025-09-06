// app/api/reviews/product/[productId]/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Review, { ReviewDocument } from "@/models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force Node runtime (not edge) because of Mongoose/NextAuth
export const runtime = "nodejs";

// ---------- Types ----------
interface ReviewRequestBody {
  rating: number;
  comment?: string;
}

interface RatingsBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

// ---------- Helpers ----------
function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

// ---------- GET: list reviews + stats (paginated) ----------
export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return badRequest("Invalid product ID");
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const sortBy = (searchParams.get("sortBy") || "newest").toLowerCase();

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "oldest") sort = { createdAt: 1 };
    if (sortBy === "highest") sort = { rating: -1 };
    if (sortBy === "lowest") sort = { rating: 1 };

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ product: productId })
        .populate("user", "name email image")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<ReviewDocument[]>(),
      Review.countDocuments({ product: productId }),
    ]);

    const [stats] = await Review.aggregate<{
      averageRating: number;
      totalReviews: number;
      ratingsBreakdown: RatingsBreakdown;
    }>([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingsCount: { $push: "$rating" },
        },
      },
      {
        $project: {
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1,
          ratingsBreakdown: {
            1: { $size: { $filter: { input: "$ratingsCount", cond: { $eq: ["$$this", 1] } } } },
            2: { $size: { $filter: { input: "$ratingsCount", cond: { $eq: ["$$this", 2] } } } },
            3: { $size: { $filter: { input: "$ratingsCount", cond: { $eq: ["$$this", 3] } } } },
            4: { $size: { $filter: { input: "$ratingsCount", cond: { $eq: ["$$this", 4] } } } },
            5: { $size: { $filter: { input: "$ratingsCount", cond: { $eq: ["$$this", 5] } } } },
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        reviews,
        pagination: {
          page,
          limit,
          totalReviews,
          totalPages: Math.ceil(totalReviews / limit),
        },
        averageRating: stats?.averageRating ?? 0,
        ratingsBreakdown:
          stats?.ratingsBreakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Error fetching product reviews:", err);
    return serverError("Failed to fetch product reviews");
  }
}

// ---------- POST: create OR update a review (auth required) ----------
export async function POST(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return badRequest("Invalid product ID");
  }

  try {
    await dbConnect();

    // Require auth
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return unauthorized();

    let body: ReviewRequestBody;
    try {
      body = (await req.json()) as ReviewRequestBody;
    } catch {
      return badRequest("Invalid JSON body");
    }

    const ratingNum = Number(body?.rating);
    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";

    if (!Number.isFinite(ratingNum)) {
      return badRequest("Rating is required and must be a number");
    }
    if (ratingNum < 1 || ratingNum > 5) {
      return badRequest("Rating must be between 1 and 5");
    }

    const review = await Review.findOneAndUpdate(
      { user: userId, product: productId },
      {
        $set: {
          rating: ratingNum,
          ...(comment.length > 0 ? { comment } : {}),
        },
        $setOnInsert: { user: userId, product: productId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).lean<ReviewDocument | null>();

    return NextResponse.json({ success: true, review }, { status: 200 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err) {
      const e = err as { code?: number };
      if (e.code === 11000) {
        return badRequest("You already reviewed this product");
      }
    }
    console.error("Error creating/updating review:", err);
    return serverError("Failed to save review");
  }
}

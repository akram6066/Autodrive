// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import ReviewModel from "@/models/Review";
import ProductModel from "@/models/Product";
import mongoose from "mongoose";

interface ReviewBody {
  productId: string;
  rating: number;
  comment: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ReviewBody = await req.json();

    // Validate input
    if (
      !body.productId ||
      !mongoose.Types.ObjectId.isValid(body.productId) ||
      !body.rating ||
      body.rating < 1 ||
      body.rating > 5 ||
      !body.comment?.trim()
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Upsert review
    const review = await ReviewModel.findOneAndUpdate(
      { user: session.user.id, product: body.productId },
      {
        user: session.user.id,
        product: body.productId,
        rating: body.rating,
        comment: body.comment.trim(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    if (!review) {
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    // Recalculate average rating
    const agg = await ReviewModel.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(body.productId) } },
      { $group: { _id: "$product", avgRating: { $avg: "$rating" } } },
    ]);

    const avgRating = agg[0]?.avgRating || 0;

    // Update product
    await ProductModel.findByIdAndUpdate(body.productId, {
      rating: avgRating,
    });

    return NextResponse.json({ success: true, avgRating });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

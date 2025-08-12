import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params for Next.js 15+
    await dbConnect();

    const { rating, comment } = await req.json();

    // Parse rating to number for validation
    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { message: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // Comment validation
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { rating: parsedRating, comment: comment.trim() },
      { new: true }
    );

    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update review" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params; // ✅ Await params

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { message: "Invalid product ID" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  await dbConnect();

  const { rating, comment } = await request.json();

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  try {
    const review = await Review.findOneAndUpdate(
      { product: productId, user: session.user.id },
      { rating, comment: comment || "" },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(review, { status: 201 });
  } catch  {
    return NextResponse.json(
      { message: "Failed to save review" },
      { status: 500 }
    );
  }
}

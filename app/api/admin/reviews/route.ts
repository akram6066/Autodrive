import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review, { ReviewDocument } from "@/models/Review";
import Product from "@/models/Product";
import { FilterQuery } from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.trim() || "";
    const rating = searchParams.get("rating");

    await dbConnect();

    const query: FilterQuery<ReviewDocument> = {};

    // Filter by rating
    if (rating) {
      const parsedRating = Number(rating);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        query.rating = parsedRating;
      }
    }

    // Search by product name
    if (search) {
      const products = await Product.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      if (products.length > 0) {
        query.product = { $in: products.map((p) => p._id) };
      } else {
        // No matching products → no results
        return NextResponse.json({
          reviews: [],
          total: 0,
          page,
          pages: 0,
        });
      }
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("product", "name")
        .populate("user", "name email")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments(query),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

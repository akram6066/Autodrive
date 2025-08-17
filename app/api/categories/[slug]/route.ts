import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";

// GET category by slug
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await context.params;

    const category = await Category.findOne({ slug });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (err) {
    console.error("Error fetching category by slug:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

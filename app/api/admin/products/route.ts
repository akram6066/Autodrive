import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import "@/models/Category"; // ✅ Register Category model for .populate to work
import slugify from "slugify";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz1234567890", 6);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    const {
      name,
      category,
      description,
      quantity,
      discountPrice,
      isOffer,
      brands,
      image,
    } = body;

    // ✅ Validate required fields
    if (!name || !category || !description || !quantity || !brands || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Generate unique slug from name
    const baseSlug = slugify(name, { lower: true, strict: true });
    const slug = `${baseSlug}-${nanoid()}`;

    // ✅ Create product
    const product = await Product.create({
      name,
      slug,
      category,
      description,
      quantity,
      discountPrice: discountPrice || 0,
      isOffer: isOffer || false,
      brands,
      image,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("POST product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");
    const brandQuery = searchParams.get("brand");

    let query = Product.find();

    // ✅ Optional category filter
    if (categoryId) {
      query = query.where("category").equals(categoryId);
    }

    // ✅ Optional brand filter
    if (brandQuery) {
      query = query.where("brands.brandName").equals(brandQuery);
    }

    // ✅ Populate category reference
    const products = await query.populate("category").sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

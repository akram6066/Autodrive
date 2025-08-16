import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/ProductType";

export async function GET() {
  await dbConnect();
  const trending = await Product.find().sort({ averageRating: -1 }).limit(10);
  return NextResponse.json(trending);
}

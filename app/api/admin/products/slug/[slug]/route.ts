// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Product from "@/models/Product";

// export async function GET(
//   request: NextRequest,
//   context: { params: { slug: string } }
// ) {
//   await dbConnect();

//   const { slug } = await Promise.resolve(context.params); // ✅ FIXED HERE

//   try {
//     const product = await Product.findOne({ slug }).populate("category");

//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     return NextResponse.json(product);
//   } catch (err) {
//     console.error("Error fetching product by slug:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  await dbConnect();

  const slug = context.params.slug;

  try {
    const product = await Product.findOne({ slug }).populate("category");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err: unknown) {
    console.error("❌ Error fetching product by slug:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Product from "@/models/ProductType";
// import  "@/models/Category"; // 👈 Needed for populate

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: { slug: string } } // ✅ plain object, not Promise
// ) {
//   await dbConnect();

//   try {
//     const { slug } = params;

//     const product = await Product.findOne({ slug }).populate("category");

//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     return NextResponse.json(product);
//   } catch (err) {
//     console.error("❌ Error fetching product by slug:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/ProductType";
import "@/models/Category"; // 👈 Needed for populate

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // ✅ Fixed: params is now Promise<{ slug: string }>
) {
  await dbConnect();
  
  try {
    const { slug } = await params; // ✅ Fixed: await the params before destructuring
    
    const product = await Product.findOne({ slug }).populate("category");
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (err) {
    console.error("❌ Error fetching product by slug:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
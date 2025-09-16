

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import slugify from "slugify";
import ImageKit from "imagekit";

// ✅ Initialize ImageKit once
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// ---------- GET ALL CATEGORIES ----------
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error("GET categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// ---------- CREATE CATEGORY ----------
export async function POST(request: Request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim() ?? "";
    const file = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // ✅ Generate clean slug
    const slug = slugify(name, { lower: true, strict: true });

    // ✅ Prevent duplicates
    const exist = await Category.findOne({ slug });
    if (exist) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    // ---------- Handle Image Upload ----------
    let imageUrl = "";
    if (file && file.size > 0) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${slug}`;

        const uploadResponse = await imagekit.upload({
          file: buffer,              // buffer from file
          fileName,                  // unique file name
          folder: "categories",      // ✅ consistent folder (no duplicate nesting)
        });

        imageUrl = uploadResponse.url;
      } catch (err) {
        console.error("ImageKit upload error:", err);
        return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
      }
    }

    // ---------- Save Category ----------
    const newCategory = await Category.create({
      name,
      slug,
      image: imageUrl,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (err) {
    console.error("POST category error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Category from "@/models/Category";
// import slugify from "slugify";
// import ImageKit from "imagekit";

// // ✅ Initialize ImageKit
// const imagekit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!, // e.g. https://ik.imagekit.io/syk5c8kkg
// });

// export async function POST(request: Request) {
//   await dbConnect();

//   const formData = await request.formData();
//   const name = formData.get("name")?.toString() ?? "";
//   const file = formData.get("image") as File | null;

//   if (!name.trim()) {
//     return NextResponse.json({ error: "Category name is required" }, { status: 400 });
//   }

//   const slug = slugify(name, { lower: true });
//   const exist = await Category.findOne({ slug });
//   if (exist) {
//     return NextResponse.json({ error: "Category already exists" }, { status: 400 });
//   }

//   let imageUrl = "";
//   if (file && file.size > 0) {
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const fileName = `${Date.now()}-${file.name}`;

//     try {
//       // ✅ Upload to ImageKit
//       const uploadResponse = await imagekit.upload({
//         file: buffer,
//         fileName,
//         folder: "/categories",
//       });

//       // ✅ Always use ImageKit's returned URL directly (no manual concat)
//       imageUrl = uploadResponse.url;
//     } catch (err: unknown) {
//       console.error("❌ ImageKit upload error:", err);
//       return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
//     }
//   }

//   const newCategory = await Category.create({
//     name,
//     slug,
//     image: imageUrl,
//   });

//   return NextResponse.json(newCategory, { status: 201 });
// }

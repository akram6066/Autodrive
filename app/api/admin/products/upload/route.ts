// import { NextResponse } from "next/server";
// import path from "path";
// import fs from "fs/promises";

// export async function POST(req: Request) {
//   const formData = await req.formData();
//   const file = formData.get("image") as File;

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const uploadDir = path.join(process.cwd(), "public/uploads");
//   await fs.mkdir(uploadDir, { recursive: true });

//   const fileName = `${Date.now()}-${file.name}`;
//   const filePath = path.join(uploadDir, fileName);
//   await fs.writeFile(filePath, buffer);

//   return NextResponse.json({ imageUrl: `/uploads/${fileName}` }, { status: 200 });
// }


import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/ProductType";
import ImageKit from "imagekit";
import { Types } from "mongoose";
import slugify from "slugify";

// 🔑 Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string, // e.g. https://ik.imagekit.io/your_id
});

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();

    // Extract fields
    const name = formData.get("name") as string;
    const categoryId = formData.get("category") as string;
    const description = formData.get("description") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const brands = JSON.parse(formData.get("brands") as string);

    // Validate categoryId
    if (!Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    // Extract file
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "Image file missing" }, { status: 400 });
    }

    // Convert file to base64 for ImageKit
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64, // required
      fileName: `${Date.now()}-${file.name}`, // required
      folder: "/products", // optional: organize in ImageKit dashboard
    });

    // Save product in DB with ImageKit URL + ObjectId category + slug
    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true }), // ✅ add slug here
      category: new Types.ObjectId(categoryId), // ✅ FIXED: ObjectId
      description,
      quantity,
      brands,
      image: uploadResponse.url,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Upload error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("Unknown error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

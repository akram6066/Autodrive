import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();

    // Get fields
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const brands = JSON.parse(formData.get("brands") as string);

    // Get file
    const file = formData.get("image") as File;

    if (!file || !file.name) {
      return NextResponse.json({ error: "Image file missing" }, { status: 400 });
    }

    // Save file to /public/uploads
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Save product to DB
    const product = await Product.create({
      name,
      category,
      description,
      quantity,
      image: `/uploads/${fileName}`,
      brands,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (err: unknown) {
    // Type-safe error handling:
    if (err instanceof Error) {
      console.error("Upload error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("Unknown error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

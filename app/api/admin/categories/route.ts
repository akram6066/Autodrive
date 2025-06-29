import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import path from "path";
import fs from "fs/promises";
import slugify from "slugify";

// GET all categories
export async function GET() {
  await dbConnect();
  const categories = await Category.find().sort({ createdAt: -1 });
  return NextResponse.json(categories);
}

// POST create category with image upload
export async function POST(request: Request) {
  await dbConnect();

  const formData = await request.formData();
  const name = formData.get("name")?.toString() ?? "";
  const file = formData.get("image") as File | null;

  if (!name.trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const slug = slugify(name, { lower: true });
  const exist = await Category.findOne({ slug });
  if (exist) {
    return NextResponse.json({ error: "Category already exists" }, { status: 400 });
  }

  let imagePath = "";
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public/uploads/categories");
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    imagePath = `/uploads/categories/${fileName}`;
  }

  const newCategory = await Category.create({
    name,
    slug,
    image: imagePath
  });

  return NextResponse.json(newCategory, { status: 201 });
}

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// GET product for edit page
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const product = await Product.findById(params.id);
  return NextResponse.json(product);
}

// PUT update product
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const brands = JSON.parse(formData.get("brands") as string);

    // ✅ Use Record type instead of any
    const updateData: Record<string, unknown> = { name, category, description, quantity, brands };

    const file = formData.get("image") as File | null;
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      updateData.image = `/uploads/${fileName}`;
    }

    const product = await Product.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Update error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

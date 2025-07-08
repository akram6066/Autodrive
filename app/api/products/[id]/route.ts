import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// GET product for edit page
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Type params as Promise
) {
  await dbConnect();

  const { id } = await params; // Await params to resolve the Promise

  try {
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err: unknown) {
    console.error("Error fetching product:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update product by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Type params as Promise
) {
  await dbConnect();

  const { id } = await params; // Await params to resolve the Promise

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const brands = JSON.parse(formData.get("brands") as string);

    // Validate input
    if (!name || !description || isNaN(quantity) || !brands) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use Record type for flexible update data
    const updateData: Record<string, unknown> = { name, description, quantity, brands };

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

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Update error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import path from "path";
import fs from "fs/promises";
import slugify from "slugify";  // ✅ Added slugify

// Interfaces
interface BrandSize {
  size: string;
  price: number;
}
interface Brand {
  brandName: string;
  sizes: BrandSize[];
}
interface UpdateData {
  name: string;
  slug: string;  // ✅ Add slug to UpdateData interface
  category: string;
  description: string;
  quantity: number;
  brands: Brand[];
  discountPrice?: number;
  isOffer?: boolean;
  image?: string;
}

// GET product by ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  await dbConnect();
  const { id } = await context.params;

  try {
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET product error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT update product by ID
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  await dbConnect();
  const { id } = await context.params;

  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString() ?? "";
    const category = formData.get("category")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const quantityStr = formData.get("quantity")?.toString() ?? "";
    const brandsStr = formData.get("brands")?.toString() ?? "";
    const discountPriceStr = formData.get("discountPrice")?.toString() ?? "";
    const isOfferStr = formData.get("isOffer")?.toString() ?? "";

    if (!name || !category || !description || !quantityStr || !brandsStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    let brands: Brand[];
    try {
      brands = JSON.parse(brandsStr);
    } catch {
      return NextResponse.json({ error: "Invalid brands data" }, { status: 400 });
    }

    const discountPrice = discountPriceStr ? parseFloat(discountPriceStr) : undefined;
    const isOffer = isOfferStr === "true";

    // ✅ Generate slug
    const slug = slugify(name, { lower: true, strict: true });

    // ✅ Check duplicate slug excluding current product id
    const exists = await Product.findOne({ slug, _id: { $ne: id } });
    if (exists) {
      return NextResponse.json({ error: "Another product with this name already exists" }, { status: 400 });
    }

    const updateData: UpdateData = {
      name,
      slug,  // ✅ Include slug in update
      category,
      description,
      quantity,
      brands,
      discountPrice,
      isOffer,
    };

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      updateData.image = `/uploads/${fileName}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE product by ID
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  await dbConnect();
  const { id } = await context.params;

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

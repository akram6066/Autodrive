import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import path from "path";
import fs from "fs/promises";
import slugify from "slugify";

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
  slug: string;
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
 const { id } = await Promise.resolve(context.params);// ✅ Fixed: No await

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
const { id } = await Promise.resolve(context.params);// ✅ Fixed: No await

  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim() || "";
    const category = formData.get("category")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const quantityStr = formData.get("quantity")?.toString().trim() || "";
    const brandsStr = formData.get("brands")?.toString().trim() || "";
    const discountPriceStr = formData.get("discountPrice")?.toString().trim() || "";
    const isOfferStr = formData.get("isOffer")?.toString().trim() || "";

    // Validation
    if (!name || !category || !description || !quantityStr || !brandsStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity value" }, { status: 400 });
    }

    let brands: Brand[];
    try {
      brands = JSON.parse(brandsStr);
      if (!Array.isArray(brands) || brands.length === 0) {
        return NextResponse.json({ error: "Brands must be a non-empty array" }, { status: 400 });
      }
    } catch {
      console.error("Invalid brands JSON:", brandsStr);
      return NextResponse.json({ error: "Invalid brands format" }, { status: 400 });
    }

    const discountPrice = discountPriceStr && !isNaN(Number(discountPriceStr))
      ? parseFloat(discountPriceStr)
      : undefined;

    const isOffer = isOfferStr === "true";

    const slug = slugify(name, { lower: true, strict: true });

    const exists = await Product.findOne({ slug, _id: { $ne: id } });
    if (exists) {
      return NextResponse.json({ error: "Another product with this name already exists" }, { status: 400 });
    }

    const updateData: UpdateData = {
      name,
      slug,
      category,
      description,
      quantity,
      brands,
    };

    if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
    if (isOfferStr) updateData.isOffer = isOffer;

    // Handle image
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      updateData.image = `/uploads/${fileName}`;
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE product by ID
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  await dbConnect();
  const { id } = context.params; // ✅ Fixed: No await

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

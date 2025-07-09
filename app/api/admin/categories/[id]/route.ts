import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category, { ICategory } from "@/models/Category";
import path from "path";
import fs from "fs/promises";
import slugify from "slugify";
import sharp from "sharp";

// Image handling constants
const IMAGE_UPLOAD_DIR = path.join(process.cwd(), "public/uploads/categories");
const IMAGE_BASE_URL = "/uploads/categories";
const IMAGE_SIZE = { width: 600, height: 600 };

async function processImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const resized = await sharp(buffer)
    .resize(IMAGE_SIZE.width, IMAGE_SIZE.height, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  await fs.mkdir(IMAGE_UPLOAD_DIR, { recursive: true });

  const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = path.join(IMAGE_UPLOAD_DIR, safeFileName);
  await fs.writeFile(filePath, resized);

  return `${IMAGE_BASE_URL}/${safeFileName}`;
}

// GET /api/admin/categories/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params; // Await params

    const category = await Category.findById(id).lean<ICategory>();
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params; // Await params
    const formData = await req.formData();

    const nameEntry = formData.get("name");
    if (typeof nameEntry !== "string" || !nameEntry.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const name = nameEntry.trim();
    const slug = slugify(name, { lower: true, strict: true });
    const file = formData.get("image") as File | null;

    const existingCategory = await Category.findOne({
      slug,
      _id: { $ne: id },
    }).lean<ICategory>();

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this name already exists",
          existingId: existingCategory._id,
        },
        { status: 409 }
      );
    }

    let imagePath: string | undefined;
    if (file && file.size > 0) {
      try {
        imagePath = await processImage(file);

        // Delete old image if exists
        const oldCategory = await Category.findById(id).lean<ICategory>();
        if (oldCategory?.image) {
          const oldImagePath = path.join(process.cwd(), "public", oldCategory.image);
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.warn("Old image not deleted:", err);
          }
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json(
          { success: false, error: "Failed to upload image" },
          { status: 400 }
        );
      }
    }

    const updateData: {
      name: string;
      slug: string;
      image?: string;
      updatedAt: Date;
    } = {
      name,
      slug,
      ...(imagePath && { image: imagePath }),
      updatedAt: new Date(),
    };

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean<ICategory>();

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params; // Await params

    const deletedCategory = await Category.findByIdAndDelete(id).lean<ICategory>();
    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    if (deletedCategory.image) {
      const imagePath = path.join(process.cwd(), "public", deletedCategory.image);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error("Failed to delete image file:", error);
      }
    }

    return NextResponse.json({
      success: true,
      data: { message: "Category deleted successfully" },
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
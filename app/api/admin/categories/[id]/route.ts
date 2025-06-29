// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Category from "@/models/Category";
// import path from "path";
// import fs from "fs/promises";
// import slugify from "slugify";
// import sharp from "sharp";

// // GET category by ID
// export async function GET(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   await dbConnect();
//   const { id } = await Promise.resolve(context.params);

//   const category = await Category.findById(id);
//   if (!category) {
//     return NextResponse.json({ error: "Category not found" }, { status: 404 });
//   }

//   return NextResponse.json(category);
// }

// // PUT - Update Category
// export async function PUT(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   await dbConnect();
//   const { id } = await Promise.resolve(context.params);

//   const formData = await request.formData();
//   const name = formData.get("name")?.toString().trim() ?? "";
//   const file = formData.get("image") as File | null;

//   if (!name) {
//     return NextResponse.json({ error: "Category name is required" }, { status: 400 });
//   }

//   const slug = slugify(name, { lower: true });

//   const exists = await Category.findOne({ slug, _id: { $ne: id } });
//   if (exists) {
//     return NextResponse.json(
//       { error: "Another category with this name already exists." },
//       { status: 400 }
//     );
//   }

//   let imagePath: string | undefined;

//   if (file && file.size > 0) {
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const resized = await sharp(buffer)
//       .resize(600, 600, { fit: "cover" })
//       .jpeg({ quality: 80 })
//       .toBuffer();

//     const uploadDir = path.join(process.cwd(), "public/uploads/categories");
//     await fs.mkdir(uploadDir, { recursive: true });

//     const safeFileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
//     const filePath = path.join(uploadDir, safeFileName);

//     await fs.writeFile(filePath, resized);
//     imagePath = `/uploads/categories/${safeFileName}`;
//   }

//   const updateData: { name: string; slug: string; image?: string } = {
//     name,
//     slug,
//   };
//   if (imagePath) updateData.image = imagePath;

//   const updated = await Category.findByIdAndUpdate(id, updateData, {
//     new: true,
//   });

//   return NextResponse.json(updated);
// }

// // DELETE category by ID
// export async function DELETE(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   await dbConnect();
//   const { id } = await Promise.resolve(context.params);

//   await Category.findByIdAndDelete(id);
//   return NextResponse.json({ message: "Category deleted successfully" });
// }



import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import path from "path";
import fs from "fs/promises";
import slugify from "slugify";
import sharp from "sharp";

// ✅ GET category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const category = await Category.findById(params.id);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

// ✅ PUT - Update Category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim() ?? "";
  const file = formData.get("image") as File | null;

  if (!name) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const slug = slugify(name, { lower: true });

  const exists = await Category.findOne({ slug, _id: { $ne: params.id } });
  if (exists) {
    return NextResponse.json(
      { error: "Another category with this name already exists." },
      { status: 400 }
    );
  }

  let imagePath: string | undefined;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(buffer)
      .resize(600, 600, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const uploadDir = path.join(process.cwd(), "public/uploads/categories");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const filePath = path.join(uploadDir, safeFileName);

    await fs.writeFile(filePath, resized);
    imagePath = `/uploads/categories/${safeFileName}`;
  }

  const updateData: { name: string; slug: string; image?: string } = {
    name,
    slug,
  };
  if (imagePath) updateData.image = imagePath;

  const updated = await Category.findByIdAndUpdate(params.id, updateData, {
    new: true,
  });

  return NextResponse.json(updated);
}

// ✅ DELETE category by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  await Category.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Category deleted successfully" });
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import mongoose, { FilterQuery } from "mongoose";

interface BrandSize {
  size: string;
  price: number;
}

interface Brand {
  brandName: string;
  sizes: BrandSize[];
}

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const query: FilterQuery<typeof Product> = {};

  // ✅ Search
  const search = searchParams.get("search");
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "brands.brandName": { $regex: search, $options: "i" } },
      { "brands.sizes.size": { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Category (multi)
  const categoryParam = searchParams.get("category");
  if (categoryParam) {
    const categoryIds = categoryParam.split(",").filter(mongoose.Types.ObjectId.isValid);
    if (categoryIds.length > 0) query.category = { $in: categoryIds };
  }

  // ✅ Brand
  const brandParam = searchParams.get("brand");
  if (brandParam) {
    const brands = brandParam.split(",").map((b) => b.trim());
    query["brands.brandName"] = { $in: brands };
  }

  // ✅ Size
  const sizeParam = searchParams.get("size");
  if (sizeParam) {
    const sizes = sizeParam.split(",").map((s) => s.trim());
    query["brands.sizes.size"] = { $in: sizes };
  }

  // ✅ Price range
  const minPrice = parseFloat(searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
  if (minPrice > 0 || maxPrice > 0) {
    query.$or = [
      { discountPrice: { $gte: minPrice, $lte: maxPrice } },
      { "brands.sizes.price": { $gte: minPrice, $lte: maxPrice } },
    ];
  }

  // ✅ Pagination
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  // ✅ Query products
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // ✅ Strict Type Mapping
  const formatted = products.map((p) => {
    const brandList: Brand[] = p.brands.map((b: Brand) => ({
      brandName: b.brandName,
      sizes: b.sizes.map((s: BrandSize) => ({ size: s.size, price: s.price })),
    }));

    return {
      id: p._id.toString(),
      slug: p.slug,
      name: p.name,
      description: p.description,
      quantity: p.quantity,
      discountPrice: p.discountPrice,
      isOffer: p.isOffer,
      image: p.image,
      category: {
        id: p.category?._id.toString(),
        name: p.category?.name,
        slug: p.category?.slug,
      },
      brands: brandList,
    };
  });

  return NextResponse.json({ total, products: formatted });
}

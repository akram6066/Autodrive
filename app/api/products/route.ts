// import { NextRequest, NextResponse } from "next/server";
// import mongoose, { FilterQuery } from "mongoose";
// import dbConnect from "@/lib/dbConnect";
// import Product from "@/models/Product";

// interface BrandSize {
//   size: string;
//   price: number;
// }

// interface Brand {
//   brandName: string;
//   sizes: BrandSize[];
// }

// export async function GET(request: NextRequest) {
//   await dbConnect();

//   const { searchParams } = new URL(request.url);
//   const query: FilterQuery<typeof Product> = {};

//   // Extract search filters
//   const search = searchParams.get("search")?.trim();
//   const categoryParam = searchParams.get("category");
//   const brandParam = searchParams.get("brand");
//   const sizeParam = searchParams.get("size");
//   const minPrice = parseFloat(searchParams.get("minPrice") || "0");
//   const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
//   const page = parseInt(searchParams.get("page") || "1");
//   const limit = parseInt(searchParams.get("limit") || "12");
//   const skip = (page - 1) * limit;

//   // 🔍 Search
//   if (search) {
//     query.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { description: { $regex: search, $options: "i" } },
//       { "brands.brandName": { $regex: search, $options: "i" } },
//       { "brands.sizes.size": { $regex: search, $options: "i" } },
//     ];
//   }

//   // 🏷️ Category filter
//   if (categoryParam) {
//     const categoryIds = categoryParam
//       .split(",")
//       .filter((id) => mongoose.Types.ObjectId.isValid(id));
//     if (categoryIds.length > 0) {
//       query.category = { $in: categoryIds };
//     }
//   }

//   // 🏷️ Brand filter
//   if (brandParam) {
//     const brands = brandParam.split(",").map((b) => b.trim());
//     query["brands.brandName"] = { $in: brands };
//   }

//   // 🏷️ Size filter
//   if (sizeParam) {
//     const sizes = sizeParam.split(",").map((s) => s.trim());
//     query["brands.sizes.size"] = { $in: sizes };
//   }

//   // 💰 Price range filter
//   if (minPrice > 0 || maxPrice > 0) {
//     query.$or = [
//       { discountPrice: { $gte: minPrice, $lte: maxPrice } },
//       { "brands.sizes.price": { $gte: minPrice, $lte: maxPrice } },
//     ];
//   }

//   // 📦 Fetch total & filtered products
//   const [total, products] = await Promise.all([
//     Product.countDocuments(query),
//     Product.find(query)
//       .populate("category")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit),
//   ]);

//   // 🎯 Format products with strict typing
//   const formatted = products.map((p) => ({
//     id: p._id.toString(),
//     slug: p.slug,
//     name: p.name,
//     description: p.description,
//     quantity: p.quantity,
//     discountPrice: p.discountPrice,
//     isOffer: p.isOffer,
//     image: p.image,
//     category: p.category
//       ? {
//           id: p.category._id.toString(),
//           name: p.category.name,
//           slug: p.category.slug,
//         }
//       : null,
//     brands: p.brands.map((b: Brand) => ({
//       brandName: b.brandName,
//       sizes: b.sizes.map((s: BrandSize) => ({
//         size: s.size,
//         price: s.price,
//       })),
//     })),
//   }));

//   return NextResponse.json({ total, products: formatted });
// }


// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose, { FilterQuery } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Product, { IProduct, Brand as BrandType, Size as SizeType } from "@/models/Product";

interface PopulatedCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

type LeanProduct = Omit<IProduct, "category"> & {
  _id: mongoose.Types.ObjectId;
  category?: PopulatedCategory | null;
};

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const query: FilterQuery<IProduct> = {};
  const andFilters: FilterQuery<IProduct>[] = [];

  // Query params
  const search = searchParams.get("search")?.trim() || "";
  const categoryParam = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const sizeParam = searchParams.get("size");
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 0);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Number(searchParams.get("limit") || 12));
  const skip = (page - 1) * limit;

  // Search filter
  if (search) {
    andFilters.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "brands.brandName": { $regex: search, $options: "i" } },
        { "brands.sizes.size": { $regex: search, $options: "i" } },
      ],
    });
  }

  // Category filter
  if (categoryParam) {
    const categoryIds = categoryParam
      .split(",")
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (categoryIds.length) {
      andFilters.push({ category: { $in: categoryIds } });
    }
  }

  // Brand filter
  if (brandParam) {
    const brands = brandParam.split(",").map((b) => b.trim());
    andFilters.push({ "brands.brandName": { $in: brands } });
  }

  // Size filter
  if (sizeParam) {
    const sizes = sizeParam.split(",").map((s) => s.trim());
    andFilters.push({ "brands.sizes.size": { $in: sizes } });
  }

  // Price filter
  if (minPrice > 0 || maxPrice > 0) {
    const priceCondition: Record<string, number> = {};
    if (minPrice > 0) priceCondition.$gte = minPrice;
    if (maxPrice > 0) priceCondition.$lte = maxPrice;

    andFilters.push({
      $or: [
        { discountPrice: priceCondition },
        { "brands.sizes.price": priceCondition },
      ],
    });
  }

  // Combine filters
  if (andFilters.length) {
    query.$and = andFilters;
  }

  // Query DB with lean + projection
  const [total, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .populate<{ category: PopulatedCategory }>("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "slug name description quantity discountPrice isOffer image category brands"
      )
      .lean<LeanProduct[]>(), // ✅ Strong typing for lean docs
  ]);

  // Map response with proper typing
  const formatted = products.map((p) => ({
    id: p._id.toString(),
    slug: p.slug,
    name: p.name,
    description: p.description,
    quantity: p.quantity,
    discountPrice: p.discountPrice ?? null,
    isOffer: p.isOffer ?? false,
    image: p.image,
    category: p.category
      ? {
          id: p.category._id.toString(),
          name: p.category.name,
          slug: p.category.slug,
        }
      : null,
    brands: p.brands.map((b: BrandType) => ({
      brandName: b.brandName,
      sizes: b.sizes.map((s: SizeType) => ({
        size: s.size,
        price: s.price,
      })),
    })),
  }));

  return NextResponse.json({ total, products: formatted });
}

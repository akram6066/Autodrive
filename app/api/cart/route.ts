// app/api/cart/merge/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import Product, { IProduct } from "@/models/Product";
import { getAuthUser } from "@/lib/getAuthUser";

interface Variant {
  brand: string;
  size: string;
}

interface CartItemInput {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  image: string;
  variant: Variant;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const userId = await getAuthUser();
    const items: CartItemInput[] = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    for (const item of items) {
      if (
        !item.productId ||
        !item.variant?.brand ||
        !item.variant?.size ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        console.warn("Skipping invalid cart item:", item);
        continue;
      }

      const product = await Product.findById(item.productId) as IProduct;
      if (!product) {
        console.warn("Product not found for ID:", item.productId);
        continue;
      }

      const brand = product.brands.find((b) => b.brandName === item.variant.brand);
      if (!brand) {
        console.warn("Brand not found:", item.variant.brand);
        continue;
      }

      const sizeOption = brand.sizes.find((s) => s.size === item.variant.size);
      if (!sizeOption) {
        console.warn("Size not found for brand:", item.variant.size);
        continue;
      }

      if (item.quantity > product.quantity) {
        console.warn("Quantity exceeds stock for:", item.productId);
        continue;
      }

      const existing = await Cart.findOne({
        userId,
        productId: item.productId,
        "variant.brand": item.variant.brand,
        "variant.size": item.variant.size,
      });

      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
      } else {
        await Cart.create({
          userId,
          productId: item.productId,
          productName: product.name,
          image: product.image,
          variant: item.variant,
          price: sizeOption.price,
          discountPrice: product.discountPrice ?? sizeOption.price,
          quantity: item.quantity,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Merge Cart Error:", err);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}

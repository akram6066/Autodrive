import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import Product, { IProduct } from "@/models/Product";
import { getAuthUser } from "@/lib/getAuthUser";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const userId = await getAuthUser();
    const body = await request.json();

    const {
      productId,
      variant,
      quantity
    }: { productId: string; variant: string; quantity: number } = body;

    if (!productId || !variant || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const product = await Product.findById(productId) as IProduct;
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let variantData: { size: string; price: number } | null = null;
    for (const brand of product.brands) {
      const foundSize = brand.sizes.find((s) => s.size === variant);
      if (foundSize) {
        variantData = foundSize;
        break;
      }
    }

    if (!variantData) {
      return NextResponse.json({ error: "Variant not found" }, { status: 400 });
    }

    if (quantity > product.quantity) {
      return NextResponse.json({ error: "Quantity exceeds stock" }, { status: 400 });
    }

    const existing = await Cart.findOne({
      userId, productId, variant
    });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return NextResponse.json(existing);
    }

    const newItem = await Cart.create({
      userId,
      productId,
      productName: product.name,
      image: product.image,
      variant,
      price: variantData.price,
      discountPrice: product.discountPrice ?? variantData.price,
      quantity
    });

    return NextResponse.json(newItem);
  } catch (err) {
    console.error("Cart POST Error:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

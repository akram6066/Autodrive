import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/getAuthUser";
import type { CartItem } from "@/types/CartItem";
import { Types } from "mongoose";

// Define interfaces for type safety
interface BrandSize {
  size: string;
  price: number;
}

interface Brand {
  sizes: BrandSize[];
}

interface ProductLean {
  _id: Types.ObjectId;
  name: string;
  image: string;
  discountPrice?: number;
  brands: Brand[];
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userId = await getAuthUser(); // Optional for guest checkout

    const { items }: { items: CartItem[] } = await request.json();

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid or empty cart payload" }, { status: 400 });
    }

    let subtotal = 0;
    const validatedItems: CartItem[] = [];

    for (const item of items) {
      // Validate item structure
      if (!item.productId || !item.variant?.size) {
        return NextResponse.json({ error: `Invalid item data for product ${item.productId}` }, { status: 400 });
      }

      const product = await Product.findById(item.productId).lean<ProductLean>();

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }

      // Find brand with matching size
      const brand = product.brands.find((b) =>
        b.sizes.some((s) => s.size === item.variant.size)
      );
      if (!brand) {
        return NextResponse.json(
          { error: `Variant not found for product ${item.productId}` },
          { status: 400 }
        );
      }

      // Find size within brand
      const size = brand.sizes.find((s) => s.size === item.variant.size);
      if (!size) {
        return NextResponse.json(
          { error: `Size ${item.variant.size} not found for product ${item.productId}` },
          { status: 400 }
        );
      }

      const serverPrice = size.price;
      const serverDiscount = product.discountPrice ?? serverPrice;

      // Validate price consistency
      if (item.price !== serverPrice || item.discountPrice !== serverDiscount) {
        return NextResponse.json(
          { error: `Price mismatch for product ${item.productId}` },
          { status: 400 }
        );
      }

      subtotal += serverDiscount * item.quantity;

      validatedItems.push({
        productId: String(product._id),
        name: product.name,
        price: serverPrice,
        discountPrice: serverDiscount,
        image: product.image,
        variant: item.variant, // Preserve full variant object
        quantity: item.quantity,
      });
    }

    // Create order
    const order = await Order.create({
      userId: userId ?? null,
      items: validatedItems,
      subtotal,
      total: subtotal, // Add logic for taxes/shipping if needed
      status: "pending",
    });

    return NextResponse.json({ success: true, orderId: String(order._id) }, { status: 201 });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/getAuthUser";
import type { CartItem } from "@/types/CartItem";
import { Types } from "mongoose";

// Define brand/size types
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

    const userId = await getAuthUser(); // Optional if guest checkout

    const { items }: { items: CartItem[] } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
    }

    let subtotal = 0;
    const validatedItems: CartItem[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).lean<ProductLean>();

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const brand = product.brands.find((b) =>
        b.sizes.some((s) => s.size === item.variant)
      );
      if (!brand) {
        return NextResponse.json({ error: `Variant not found` }, { status: 400 });
      }

      const size = brand.sizes.find((s) => s.size === item.variant);
      if (!size) {
        return NextResponse.json({ error: `Size not found` }, { status: 400 });
      }

      const serverPrice = size.price;
      const serverDiscount = product.discountPrice ?? serverPrice;

      if (item.price !== serverPrice || item.discountPrice !== serverDiscount) {
        return NextResponse.json({ error: `Price mismatch detected` }, { status: 400 });
      }

      subtotal += serverDiscount * item.quantity;

      validatedItems.push({
        productId: String(product._id),
        name: product.name,
        price: serverPrice,
        discountPrice: serverDiscount,
        image: product.image,
        variant: item.variant,
        quantity: item.quantity,
      });
    }

    const order = await Order.create({
      userId: userId ?? null,
      items: validatedItems,
      subtotal,
      total: subtotal,
      status: "pending",
    });

    return NextResponse.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

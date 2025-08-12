

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import { getAuthUser } from "@/lib/getAuthUser";
import type { CartItem } from "@/types/CartItem";

function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;

  const it = item as Partial<CartItem>;

  return (
    typeof it.productId === "string" &&
    typeof it.name === "string" &&
    typeof it.price === "number" &&
    typeof it.discountPrice === "number" &&
    typeof it.image === "string" &&
    typeof it.quantity === "number" &&
    typeof it.variant === "object" &&
    it.variant !== null &&
    typeof it.variant.brand === "string" &&
    typeof it.variant.size === "string"
  );
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const userId = await getAuthUser();
    const body = await request.json();

    const items: unknown = body?.items;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload: items should be an array" }, { status: 400 });
    }

    const validatedItems = items.filter(isValidCartItem);

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: "No valid cart items found" }, { status: 400 });
    }

    for (const item of validatedItems) {
      const existing = await Cart.findOne({
        userId,
        productId: item.productId,
        variant: item.variant,
      });

      if (existing) {
        existing.quantity += item.quantity;
        await existing.save();
      } else {
        await Cart.create({
          userId,
          productId: item.productId,
          productName: item.name,
          image: item.image,
          variant: item.variant,
          price: item.price,
          discountPrice: item.discountPrice,
          quantity: item.quantity,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart Merge Error:", error);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}

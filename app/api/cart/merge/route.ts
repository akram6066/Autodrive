import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import { getAuthUser } from "@/lib/getAuthUser";
import type { CartItem } from "@/types/CartItem";  // ✅ Import shared type

export async function POST(request: Request) {
  try {
    await dbConnect();
    const userId = await getAuthUser();
    const { items }: { items: CartItem[] } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    for (const item of items) {
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
  } catch (err) {
    console.error("Merge Cart Error:", err);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import { getAuthUser } from "@/lib/getAuthUser";

export async function PUT(request: Request, { params }: { params: { itemId: string } }) {
  try {
    await dbConnect();
    const userId = await getAuthUser();
    const { quantity }: { quantity: number } = await request.json();

    if (quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const item = await Cart.findOneAndUpdate(
      { _id: params.itemId, userId },
      { quantity },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("Cart PUT Error:", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
  try {
    await dbConnect();
    const userId = await getAuthUser();

    const result = await Cart.findOneAndDelete({ _id: params.itemId, userId });
    if (!result) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cart DELETE Error:", err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}

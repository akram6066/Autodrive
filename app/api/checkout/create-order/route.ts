// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose, { Document } from "mongoose";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/ProductType";
import User from "@/models/User";

// ---------- Types ----------
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  image?: string;
  variant: string | { brand: string; size: string };
  quantity: number;
}

interface Size {
  size: string;
  stock: number;
}

interface Brand {
  brandName: string;
  sizes: Size[];
}

interface ProductDoc extends Document {
  name: string;
  brands: Brand[];
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    console.log("✅ DB connected");

    // 🔹 Get logged-in user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Find user in DB
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔹 Get order data from request
    const {
      items,
      subtotal,
      total,
      phone,
      address,
      paymentMethod,
    }: {
      items: CartItem[];
      subtotal: number;
      total: number;
      phone: string;
      address: string;
      paymentMethod: "mpesa" | "cod";
    } = await req.json();

    // 🔹 Validate
    if (
      !items?.length ||
      subtotal == null ||
      total == null ||
      !phone ||
      !address ||
      !paymentMethod
    ) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    // 🔹 Prepare items for DB
    const cleanedItems = items.map((item) => {
      const actualPrice =
        item.discountPrice > 0 ? item.discountPrice : item.price;
      const stringifiedVariant =
        typeof item.variant === "string"
          ? item.variant
          : JSON.stringify(item.variant);

      return {
        productId: item.productId,
        name: item.name,
        variant: stringifiedVariant,
        quantity: item.quantity,
        price: actualPrice,
        discountApplied: item.discountPrice > 0,
        subtotal: actualPrice * item.quantity,
        image: item.image || null,
      };
    });

    // 🔹 Reduce stock for each item
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        console.warn(`⚠ Invalid productId: ${item.productId}`);
        continue;
      }

      const product = (await Product.findById(item.productId)) as ProductDoc | null;
      if (!product) {
        console.warn(`⚠ Product not found: ${item.productId}`);
        continue;
      }

      const variantData =
        typeof item.variant === "string"
          ? (JSON.parse(item.variant) as { brand: string; size: string })
          : item.variant;

      const brand = product.brands.find(
        (b: Brand) => b.brandName === variantData.brand
      );
      if (!brand) {
        console.warn(`⚠ Brand not found: ${variantData.brand}`);
        continue;
      }

      const sizeObj = brand.sizes.find(
        (s: Size) => s.size === variantData.size
      );
      if (!sizeObj) {
        console.warn(`⚠ Size not found: ${variantData.size}`);
        continue;
      }

      // Prevent overselling
      if (sizeObj.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for ${product.name} - ${brand.brandName} ${sizeObj.size}`,
          },
          { status: 400 }
        );
      }

      // Reduce stock
      sizeObj.stock -= item.quantity;
      await product.save();
    }

    // 🔹 Create order
    const newOrder = await Order.create({
      user: dbUser._id,
      userEmail: session.user.email,
      userName: session.user.name,
      items: cleanedItems,
      subtotal,
      total,
      phone,
      address,
      paymentMethod,
      status: paymentMethod === "cod" ? "pending" : "unpaid",
    });

    console.log("✅ Order created:", newOrder._id);
    return NextResponse.json({ orderId: newOrder._id });
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

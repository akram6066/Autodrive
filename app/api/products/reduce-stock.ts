// pages/api/products/reduce-stock.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/dbConnect";
import Product from "@/models/Product";
import { Document } from "mongoose";

// ---- Types ----
interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  image: string;
  variant: {
    brand: string;
    size: string;
  };
  quantity: number;
}

interface Brand {
  brandName: string;
  sizes: Size[];
}

interface Size {
  size: string;
  stock: number;
}

// Extend your Product type to match what's in DB
interface ProductDoc extends Document {
  name: string;
  brands: Brand[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message?: string; error?: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { items } = req.body as { items: CartItem[] };

    // Validate request data
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items data" });
    }

    await Promise.all(
      items.map(async (item: CartItem) => {
        if (
          !item.productId ||
          !item.variant?.brand ||
          !item.variant?.size ||
          !item.quantity
        ) {
          return;
        }

        const qty = Number(item.quantity);
        if (isNaN(qty) || qty <= 0) return;

        // Find product
        const product = (await Product.findById(item.productId)) as ProductDoc | null;
        if (!product) return;

        // Find brand
        const brand = product.brands.find(
          (b: Brand) => b.brandName === item.variant.brand
        );
        if (!brand) return;

        // Find size
        const sizeObj = brand.sizes.find(
          (s: Size) => s.size === item.variant.size
        );
        if (!sizeObj) return;

        // Check stock availability
        if (sizeObj.stock < qty) {
          throw new Error(
            `Not enough stock for ${product.name} - ${brand.brandName} ${sizeObj.size}`
          );
        }

        // Reduce stock
        sizeObj.stock -= qty;
        await product.save();
      })
    );

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error reducing stock:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
}

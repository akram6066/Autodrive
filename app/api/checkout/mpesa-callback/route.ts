// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/ProductType";

// --- Types ---
interface CallbackItem {
  Name: "Amount" | "MpesaReceiptNumber" | "PhoneNumber";
  Value: string | number;
}

interface STKCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: CallbackItem[];
  };
}

interface DarajaCallbackBody {
  Body: {
    stkCallback: STKCallback;
  };
}

interface OrderItemVariant {
  brand: string;
  size: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  variant: OrderItemVariant | string; // Some may be stringified JSON
}

export async function POST(req: NextRequest) {
  await connectDB();

  const body: DarajaCallbackBody = await req.json();
  const callback = body?.Body?.stkCallback;

  // ❌ Failed payment
  if (callback.ResultCode !== 0 || !callback.CallbackMetadata?.Item) {
    console.warn(`❌ STK Push failed: ${callback?.ResultDesc}`);
    return NextResponse.json({ received: true });
  }

  const metadata = callback.CallbackMetadata.Item;

  const amount = metadata.find((i): i is CallbackItem & { Value: number } => i.Name === "Amount")
    ?.Value;
  const phone = metadata.find((i): i is CallbackItem & { Value: number } => i.Name === "PhoneNumber")
    ?.Value;
  const mpesaReceipt = metadata.find(
    (i): i is CallbackItem & { Value: string } => i.Name === "MpesaReceiptNumber"
  )?.Value;

  if (!amount || !phone || !mpesaReceipt) {
    return NextResponse.json({ success: false, error: "Missing metadata" }, { status: 400 });
  }

  // 🔍 Find the latest pending order
  const order = await Order.findOne({
    total: amount,
    status: "pending",
  }).sort({ createdAt: -1 });

  if (!order) {
    console.warn(`⚠️ No pending order found matching amount: ${amount}`);
    return NextResponse.json({ received: true });
  }

  // ✅ Avoid duplicate payment handling
  if (order.status === "paid") {
    console.log(`ℹ️ Order ${order._id} already paid. Skipping stock update.`);
    return NextResponse.json({ received: true });
  }

  // Update payment status
  order.status = "paid";
  order.paymentDetails = {
    phone,
    receipt: mpesaReceipt,
    paidAt: new Date(),
  };

  // 🏭 Reduce stock per product variant
  for (const item of order.items as OrderItem[]) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const variantData: OrderItemVariant =
      typeof item.variant === "string" ? JSON.parse(item.variant) : item.variant;

    const brand = product.brands.find((b: { brandName: string }) => b.brandName === variantData.brand);
    if (!brand) continue;

    const sizeObj = brand.sizes.find((s: { size: string; stock: number }) => s.size === variantData.size);
    if (!sizeObj) continue;

    if (sizeObj.stock < item.quantity) {
      console.warn(`⚠️ Not enough stock for ${product.name} ${brand.brandName} ${sizeObj.size}`);
      continue;
    }

    sizeObj.stock -= item.quantity;
    await product.save();
  }

  await order.save();
  console.log(`✅ Order ${order._id} marked as paid & stock reduced.`);

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Order from "@/models/Order";


// Define Safaricom metadata types
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

export async function POST(req: NextRequest) {
  await connectDB();

  const body: DarajaCallbackBody = await req.json();
  const callback = body?.Body?.stkCallback;

  if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
    const metadata = callback.CallbackMetadata.Item;

    const amount = metadata.find((item): item is CallbackItem & { Value: number } => item.Name === "Amount")?.Value;
    const phone = metadata.find((item): item is CallbackItem & { Value: number } => item.Name === "PhoneNumber")?.Value;
    const mpesaReceipt = metadata.find((item): item is CallbackItem & { Value: string } => item.Name === "MpesaReceiptNumber")?.Value;

    if (!amount || !phone || !mpesaReceipt) {
      return NextResponse.json({ success: false, error: "Missing metadata" }, { status: 400 });
    }

    // Find latest pending order by amount
    const order = await Order.findOne({ total: amount, status: "pending" }).sort({ createdAt: -1 });

    if (order) {
      order.status = "paid";
      await order.save();
      console.log(`✅ Order ${order._id} marked as paid via M-PESA. Receipt: ${mpesaReceipt}`);
    } else {
      console.warn(`⚠️ No pending order found matching amount: ${amount}`);
    }
  } else {
    console.warn(`❌ STK Push failed. ResultDesc: ${callback.ResultDesc}`);
  }

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Order from "@/models/Order";

const baseURL = "https://sandbox.safaricom.co.ke";

// Format current date to M-PESA required format
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
}

interface StkRequestBody {
  phone: string;
  orderId: string;
}

export async function POST(req: NextRequest) {
  await connectDB();

  let body: StkRequestBody;

  // Parse and validate request body
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { phone, orderId } = body;

  if (!phone || !orderId) {
    return NextResponse.json({ error: "Missing phone or orderId" }, { status: 400 });
  }

  // Find order and validate status
  const order = await Order.findById(orderId);
  if (!order || order.status !== "pending") {
    return NextResponse.json({ error: "Invalid or already paid order" }, { status: 400 });
  }

  // Environment constants
  const timestamp = getTimestamp();
  const businessShortCode = process.env.BUSINESS_SHORT_CODE!;
  const passkey = process.env.PASSKEY!;
  const consumerKey = process.env.DARAJA_CONSUMER_KEY!;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET!;
  const callbackURL = process.env.CALLBACK_URL!;

  // Encode password
  const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString("base64");

  // Generate OAuth token
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const tokenRes = await fetch(`${baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  const tokenData: { access_token?: string; error_description?: string } = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.json(
      { error: "Failed to get access token", details: tokenData.error_description },
      { status: 400 }
    );
  }

  const token = tokenData.access_token;

  // STK Push payload
  const stkPayload = {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: order.total,
    PartyA: phone,
    PartyB: businessShortCode,
    PhoneNumber: phone,
    CallBackURL: callbackURL,
    AccountReference: `Order-${order._id}`,
    TransactionDesc: "E-commerce order payment",
  };

  // Send STK Push request
  const stkRes = await fetch(`${baseURL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stkPayload),
  });

  const result: {
    ResponseCode?: string;
    ResponseDescription?: string;
    CustomerMessage?: string;
    errorMessage?: string;
  } = await stkRes.json();

  // Handle failure
  if (result.ResponseCode !== "0") {
    return NextResponse.json(
      { error: result.errorMessage || "STK Push failed", details: result },
      { status: 400 }
    );
  }

  // Optional: Save M-PESA response or log
  await Order.findByIdAndUpdate(orderId, {
    $set: {
      paymentAttempt: {
        initiatedAt: new Date(),
        status: "pending",
        phone: phone,
        amount: order.total,
      },
    },
  });

  return NextResponse.json({
    message: result.CustomerMessage,
    status: "initiated",
  });
}

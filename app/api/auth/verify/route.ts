import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  const { email, code } = await req.json();

  // ✅ Validate properly
  if (typeof email !== "string" || typeof code !== "string" || !email.trim() || !code.trim()) {
    return NextResponse.json({ message: "Email and verification code are required." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (user.verificationCode !== code) {
    return NextResponse.json({ message: "Invalid verification code." }, { status: 400 });
  }

  user.emailVerified = true;
  user.verificationCode = undefined;
  await user.save();

  return NextResponse.json({ message: "Email verified successfully." });
}

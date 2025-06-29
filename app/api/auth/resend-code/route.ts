import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  await dbConnect();

  const { email } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"AutoDrive Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Resend Verification Code",
    html: `
      <h2>Hello ${user.name} 👋</h2>
      <p>Please verify your account using the following code:</p>
      <h1>${user.verificationCode}</h1>
    `,
  });

  return NextResponse.json({ message: "Verification code resent." });
}

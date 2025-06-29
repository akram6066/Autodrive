import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ message: "All fields are required." }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json({ message: "Email already registered." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationCode,     // ✅ Save code into DB
      emailVerified: false  // ✅ Mark email not yet verified
    });

    await newUser.save();

    // ✅ Send verification email
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
      subject: "Verify your AutoDrive account",
      html: `
        <h2>Hello ${name} 👋</h2>
        <p>Thank you for signing up to AutoDrive.</p>
        <p>Please verify your account using the following code:</p>
        <h1>${verificationCode}</h1>
        <p>This code will expire soon.</p>
      `,
    });

    return Response.json({ message: "Account created successfully. Verification email sent." }, { status: 201 });

  } catch (err: unknown) {
    console.error(err);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}

import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { sendEmail } from "@/lib/mailer"
import crypto from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  await dbConnect()

  const { email } = await req.json()
  const user = await User.findOne({ email })

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  const token = crypto.randomBytes(20).toString('hex')
  user.resetPasswordToken = token
  user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
  await user.save()

  await sendEmail(email, "Reset Password", `
    <h1>Reset Your Password</h1>
    <p>Click here to reset: 
      <a href="${process.env.NEXTAUTH_URL}/reset-password/${token}">Reset Password</a>
    </p>
  `)

  return NextResponse.json({ message: "Reset link sent!" })
}

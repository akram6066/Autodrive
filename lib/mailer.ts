import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"AutoDrive" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  })
}

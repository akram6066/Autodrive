import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const search = searchParams.get("search") || "";
  const role = searchParams.get("role");
  const emailVerified = searchParams.get("emailVerified");

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (emailVerified === "true") query.emailVerified = true;
  if (emailVerified === "false") query.emailVerified = false;

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-password");

  const total = await User.countDocuments(query);

  return NextResponse.json({ users, total });
}

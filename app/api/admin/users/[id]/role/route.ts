// /api/admin/users/role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    // ✅ Step 1: Ensure request is JSON
    if (req.headers.get("content-type") !== "application/json") {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 } // Unsupported Media Type
      );
    }

    // ✅ Step 2: Authenticate user
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Step 3: Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { userId, newRole } = body;
    console.log("PATCH /api/admin/users/role received:", body);

    // ✅ Step 4: Validate input
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
    }
    if (!newRole || !["admin", "user"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // ✅ Step 5: Prevent self-role change
    if (token.sub === userId) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 403 }
      );
    }

    // ✅ Step 6: Connect DB & update
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Step 7: Success
    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Role update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

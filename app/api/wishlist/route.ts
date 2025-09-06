// app/api/wishlist/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Wishlist, { IWishlistDoc } from "@/models/WishlistItem";
import type { WishlistItem, WishlistApiResponse } from "@/types/wishlist";
import { randomUUID } from "crypto";

// ---------------- Helpers ----------------

// Get userId or guestId (set cookie if missing)
async function getUserOrGuestId() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies(); 
  let guestId = cookieStore.get("guestId")?.value;

  if (!guestId) {
    guestId = randomUUID();
  }

  return { userId: session?.user?.id ?? null, guestId };
}

// Parse JSON safely
async function parseJson<T extends Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    const body = await req.json();
    return typeof body === "object" && body !== null ? (body as T) : null;
  } catch {
    return null;
  }
}

// Standardized error response
function error(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

// Map DB documents to API items
function mapDocsToItems(docs: IWishlistDoc[]): WishlistItem[] {
  return docs
    .filter((d) => d.productId && d.createdAt)
    .map((d) => ({
      productId: d.productId!.toString(),
      productSnapshot: d.snapshot ?? undefined,
      addedAt: d.createdAt!.toISOString(),
    }));
}

// Build filter based on user or guest
function buildFilter(userId: string | null, guestId: string) {
  return userId ? { user: userId } : { guestId };
}

// ---------------- GET /api/wishlist ----------------
export async function GET() {
  try {
    await dbConnect();
    const { userId, guestId } = await getUserOrGuestId();

    const docs = await Wishlist.find(buildFilter(userId, guestId))
      .select("productId snapshot createdAt -_id")
      .sort({ createdAt: -1 })
      .lean<IWishlistDoc[]>();

    const res = NextResponse.json<WishlistApiResponse>({
      total: docs.length,
      items: mapDocsToItems(docs),
    });

    // persist guestId if not set yet
    if (!userId) {
      res.cookies.set("guestId", guestId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return res;
  } catch (err) {
    console.error("❌ GET /wishlist failed:", err);
    return error("Server error", 500);
  }
}

// ---------------- POST /api/wishlist ----------------
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, guestId } = await getUserOrGuestId();

    const body = await parseJson<{ productId: string; snapshot?: WishlistItem["productSnapshot"] }>(req);
    if (!body?.productId) return error("Invalid productId");

    const exists = await Wishlist.exists({
      ...buildFilter(userId, guestId),
      productId: body.productId,
    });
    if (exists) return error("Already in wishlist", 409);

    const created = await Wishlist.create({
      user: userId ?? undefined,
      guestId: userId ? undefined : guestId,
      productId: body.productId,
      snapshot: body.snapshot,
    });

    const res = NextResponse.json({
      message: "Added to wishlist",
      item: {
        productId: created.productId!.toString(),
        productSnapshot: created.snapshot ?? undefined,
        addedAt: created.createdAt!.toISOString(),
      },
    });

    if (!userId) {
      res.cookies.set("guestId", guestId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (err) {
    console.error("❌ POST /wishlist failed:", err);
    return error("Server error", 500);
  }
}

// ---------------- DELETE /api/wishlist ----------------
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { userId, guestId } = await getUserOrGuestId();

    const body = await parseJson<{ productId: string }>(req);
    if (!body?.productId) return error("Invalid productId");

    const deleted = await Wishlist.deleteOne({ ...buildFilter(userId, guestId), productId: body.productId });
    if (!deleted.deletedCount) return error("Not found in wishlist", 404);

    const res = NextResponse.json({ message: "Removed", productId: body.productId });

    if (!userId) {
      res.cookies.set("guestId", guestId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (err) {
    console.error("❌ DELETE /wishlist failed:", err);
    return error("Server error", 500);
  }
}

// ---------------- PATCH /api/wishlist (sync) ----------------
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { userId, guestId } = await getUserOrGuestId();

    const body = await parseJson<{ items: { productId: string; snapshot?: WishlistItem["productSnapshot"] }[] }>(req);
    if (!body?.items?.length) return error("No items to sync");

    const ops = body.items.map((it) => ({
      updateOne: {
        filter: { ...buildFilter(userId, guestId), productId: it.productId },
        update: { $setOnInsert: { snapshot: it.snapshot, createdAt: new Date() } },
        upsert: true,
      },
    }));

    await Wishlist.bulkWrite(ops, { ordered: false });

    const docs = await Wishlist.find(buildFilter(userId, guestId))
      .select("productId snapshot createdAt -_id")
      .sort({ createdAt: -1 })
      .lean<IWishlistDoc[]>();

    const res = NextResponse.json<WishlistApiResponse>({
      total: docs.length,
      items: mapDocsToItems(docs),
    });

    if (!userId) {
      res.cookies.set("guestId", guestId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (err) {
    console.error("❌ PATCH /wishlist failed:", err);
    return error("Server error", 500);
  }
}

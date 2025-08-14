// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req });
//   const isAdmin = token?.role === "admin";

//   if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"], // ✅ FIXED: avoids breaking /api routes
// };


import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAdmin = token?.role === "admin";

  // ✅ Protect admin dashboard pages
  if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Protect admin API endpoints
  if (req.nextUrl.pathname.startsWith("/api/admin") && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Protect order API for logged-in users only
  if (req.nextUrl.pathname.startsWith("/api/orders") && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // admin dashboard
    "/api/admin/:path*", // admin-only API
    "/api/orders/:path*", // protected orders API
  ],
};

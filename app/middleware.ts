// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req });
//   const isAdmin = token?.role === "admin";
//   const path = req.nextUrl.pathname;

//   // Public admin APIs (accessible without admin)
//   const publicAdminAPIs = [
//     /^\/api\/admin\/categories\/slug\/[^/]+$/, // matches /api/admin/categories/slug/{slug}
//     /^\/api\/admin\/products\/category\/[^/]+$/ // matches /api/admin/products/category/{categoryId}
//   ];

//   // If the request matches a public admin API, skip auth checks
//   if (publicAdminAPIs.some((regex) => regex.test(path))) {
//     return NextResponse.next();
//   }

//   // ✅ Protect admin dashboard pages
//   if (path.startsWith("/admin") && !isAdmin) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // ✅ Protect admin API endpoints
//   if (path.startsWith("/api/admin") && !isAdmin) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // ✅ Protect order API for logged-in users only
//   if (path.startsWith("/api/orders") && !token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",        // admin dashboard
//     "/api/admin/:path*",    // admin-only API
//     "/api/orders/:path*",   // protected orders API
//   ],
// };


import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = token?.role === "admin";
  const path = req.nextUrl.pathname;

  // Public admin APIs (accessible without admin)
  const publicAdminAPIs = [
    /^\/api\/admin\/categories\/slug\/[^/]+$/,
    /^\/api\/admin\/products\/category\/[^/]+$/,
  ];

  // If the request matches a public admin API, skip auth checks
  if (publicAdminAPIs.some((regex) => regex.test(path))) {
    return NextResponse.next();
  }

  // Protect admin dashboard pages
  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect admin API endpoints
  if (path.startsWith("/api/admin") && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Protect order API for logged-in users only
  if (path.startsWith("/api/orders") && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/orders/:path*",
  ],
};

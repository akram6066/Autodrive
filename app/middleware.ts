

// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const isAdmin = token?.role === "admin";
//   const path = req.nextUrl.pathname;

//   // Public admin APIs (accessible without admin)
//   const publicAdminAPIs = [
//     /^\/api\/admin\/categories\/slug\/[^/]+$/,
//     /^\/api\/admin\/products\/category\/[^/]+$/,
//   ];

//   // If the request matches a public admin API, skip auth checks
//   if (publicAdminAPIs.some((regex) => regex.test(path))) {
//     return NextResponse.next();
//   }

//   // Protect admin dashboard pages
//   if (path.startsWith("/admin")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//     if (!isAdmin) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   // Protect admin API endpoints
//   if (path.startsWith("/api/admin") && !isAdmin) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // Protect order API for logged-in users only
//   if (path.startsWith("/api/orders") && !token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/api/admin/:path*",
//     "/api/orders/:path*",
//   ],
// };


// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// ✅ Define all public admin API endpoints as a readonly tuple
const publicAdminAPIs = [
  "/api/admin/categories/slug",      // category by slug
  "/api/admin/products/category",    // products by category ID
] as const;

// 🔹 Type for public admin endpoints
type PublicAdminEndpoint = (typeof publicAdminAPIs)[number];

/**
 * Check if the given path matches any explicitly allowed public admin API.
 * Using the PublicAdminEndpoint type ensures we only work with known paths.
 */
function isPublicAdminEndpoint(pathname: string): boolean {
  return (publicAdminAPIs as readonly PublicAdminEndpoint[])
    .some(publicPath =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`)
    );
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAdmin = token?.role === "admin";
  const pathname = req.nextUrl.pathname as string;

  // 1️⃣ Protect admin dashboard pages
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2️⃣ Protect admin API endpoints (except the explicitly allowed public ones)
  if (pathname.startsWith("/api/admin")) {
    if (!isPublicAdminEndpoint(pathname) && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // 3️⃣ Protect orders API for logged-in users only
  if (pathname.startsWith("/api/orders") && !token) {
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

// // app/api/auth/refresh/route.ts
// import { NextResponse } from "next/server";
// import { getRefreshToken, issueNewAccessToken } from "@/lib/auth";

// export async function POST() {
//   try {
//     const refreshToken = await getRefreshToken();
//     if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

//     const newToken = await issueNewAccessToken(refreshToken);
//     return NextResponse.json({ accessToken: newToken });
//   } catch {
//     return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
//   }
// }

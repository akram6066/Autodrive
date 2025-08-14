

// export async function absoluteFetch<T>(path: string, options?: RequestInit): Promise<T> {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");

//   if (!baseUrl) {
//     throw new Error("❌ NEXT_PUBLIC_BASE_URL is not defined in environment variables");
//   }

//   const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

//   let res: Response;
//   try {
//     res = await fetch(url, {
//       method: "GET",
//       ...options,
//     });
//   } catch (networkError) {
//     throw new Error(`🌐 Network error while fetching ${url}: ${(networkError as Error).message}`);
//   }

//   if (!res.ok) {
//     throw new Error(`⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`);
//   }

//   try {
//     const data: unknown = await res.json();
//     return data as T;
//   } catch (parseError) {
//     throw new Error(`📦 Failed to parse JSON from ${url}: ${(parseError as Error).message}`);
//   }
// }


export async function absoluteFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Determine base URL using same logic as in RootLayout
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"); // Local dev fallback

  // Ensure path has leading slash
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      ...options,
    });
  } catch (networkError) {
    throw new Error(
      `🌐 Network error while fetching ${url}: ${(networkError as Error).message}`
    );
  }

  if (!res.ok) {
    throw new Error(`⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`);
  }

  try {
    const data: unknown = await res.json();
    return data as T;
  } catch (parseError) {
    throw new Error(
      `📦 Failed to parse JSON from ${url}: ${(parseError as Error).message}`
    );
  }
}

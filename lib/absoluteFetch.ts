

import { headers } from "next/headers";

/**
 * Fetch data from an internal or external API.
 * - Uses NEXT_PUBLIC_BASE_URL if defined.
 * - Falls back to runtime host detection in Server Components.
 */
export async function absoluteFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  // Build base URL safely
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    // This works in Server Components (Next.js 13+)
    const host = headers().get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    baseUrl = `${protocol}://${host}`;
  }

  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      ...options,
    });
  } catch (networkError) {
    console.error(`🌐 Network error while fetching ${url}:`, networkError);
    throw new Error(`Network request failed: ${url}`);
  }

  if (!res.ok) {
    console.error(`⚠️ Request failed: ${url}`, res.status, res.statusText);
    throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
  }

  try {
    return (await res.json()) as T;
  } catch (parseError) {
    console.error(`📦 JSON parse error: ${url}`, parseError);
    throw new Error(`Invalid JSON response from ${url}`);
  }
}

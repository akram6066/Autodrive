

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


// lib/absoluteFetch.ts
type AbsoluteFetchOptions = RequestInit & {
  auth?: boolean;   // must explicitly set true to send auth
  token?: string;   // optional override token
};

export async function absoluteFetch<T>(
  path: string,
  options: AbsoluteFetchOptions = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  // Use Record<string, string> for predictable header typing
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  // Only attach Authorization if auth is explicitly true
  if (options.auth === true) {
    const token =
      options.token ||
      (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");

    if (!token) {
      throw new Error(`Authentication required for ${url}, but no token provided`);
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method || "GET",
      headers,
      credentials: options.auth === true ? "include" : "same-origin",
      ...options,
    });
  } catch (networkError) {
    throw new Error(`🌐 Network error while fetching ${url}: ${(networkError as Error).message}`);
  }

  if (!res.ok) {
    throw new Error(`⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`);
  }

  try {
    return (await res.json()) as T;
  } catch (parseError) {
    throw new Error(`📦 Failed to parse JSON from ${url}: ${(parseError as Error).message}`);
  }
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.URL) {
    return process.env.URL;
  }
  return "http://localhost:3000";
}



// // lib/absoluteFetch.ts
// type AbsoluteFetchOptions = RequestInit & {
//   auth?: boolean;   // must explicitly set true to send auth
//   token?: string;   // optional override token
// };

// export async function absoluteFetch<T>(
//   path: string,
//   options: AbsoluteFetchOptions = {}
// ): Promise<T> {
//   const baseUrl = getBaseUrl();
//   const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

//   // Use Record<string, string> for predictable header typing
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(options.headers as Record<string, string> ?? {}),
//   };

//   // Only attach Authorization if auth is explicitly true
//   if (options.auth === true) {
//     const token =
//       options.token ||
//       (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");

//     if (!token) {
//       throw new Error(`Authentication required for ${url}, but no token provided`);
//     }
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   let res: Response;
//   try {
//     res = await fetch(url, {
//       method: options.method || "GET",
//       headers,
//       credentials: options.auth === true ? "include" : "same-origin",
//       ...options,
//     });
//   } catch (networkError) {
//     throw new Error(`🌐 Network error while fetching ${url}: ${(networkError as Error).message}`);
//   }

//   if (!res.ok) {
//     throw new Error(`⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`);
//   }

//   try {
//     return (await res.json()) as T;
//   } catch (parseError) {
//     throw new Error(`📦 Failed to parse JSON from ${url}: ${(parseError as Error).message}`);
//   }
// }

// function getBaseUrl(): string {
//   if (process.env.NEXT_PUBLIC_BASE_URL) {
//     return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
//   }
//   if (typeof window !== "undefined") {
//     return window.location.origin;
//   }
//   if (process.env.VERCEL_URL) {
//     return `https://${process.env.VERCEL_URL}`;
//   }
//   if (process.env.URL) {
//     return process.env.URL;
//   }
//   return "http://localhost:3000";
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  // Attach Authorization header only if explicitly requested
  if (options.auth) {
    const token =
      options.token ||
      (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : process.env.API_TOKEN ?? "");

    if (!token) {
      throw new Error(`Authentication required for ${url}, but no token provided`);
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      method: options.method || "GET",
      headers,
      // Only meaningful in browser; ignored in server
      credentials: options.auth ? "include" : "same-origin",
      cache: options.cache ?? "no-store",
    });
  } catch (err) {
    throw new Error(`🌐 Network error while fetching ${url}: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new Error(`⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`);
  }

  try {
    return (await res.json()) as T;
  } catch (err) {
    throw new Error(`📦 Failed to parse JSON from ${url}: ${(err as Error).message}`);
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

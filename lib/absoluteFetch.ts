

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
  auth?: boolean; // true if API requires auth
  token?: string; // optional custom token
};

export async function absoluteFetch<T>(
  path: string,
  options?: AbsoluteFetchOptions
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Attach authentication if required
  if (options?.auth) {
    const token =
      options.token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("token")
        : process.env.API_SECRET_TOKEN);

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: options?.method || "GET",
      credentials: options?.auth ? "include" : "same-origin", // cookies if needed
      headers: {
        ...defaultHeaders,
        ...(options?.headers || {}),
      },
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

function getBaseUrl() {
  // Priority: Env var → window origin → Vercel → Netlify → Local
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

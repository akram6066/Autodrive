

// lib/absoluteFetch.ts
type AbsoluteFetchOptions = RequestInit & {
  auth?: boolean;   // must explicitly set true to send auth
  token?: string;   // optional override token
  next?: { revalidate?: number }; // allow ISR revalidate
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
      (typeof window !== "undefined"
        ? localStorage.getItem("token") ?? ""
        : process.env.API_TOKEN ?? "");

    if (!token) {
      throw new Error(`Authentication required for ${url}, but no token provided`);
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Build fetch config
  const fetchConfig: RequestInit & { next?: { revalidate?: number } } = {
    ...options,
    method: options.method || "GET",
    headers,
    credentials: options.auth ? "include" : "same-origin",
  };

  // Handle cache vs revalidate (avoid conflict)
  if (options.next?.revalidate !== undefined) {
    fetchConfig.next = { revalidate: options.next.revalidate };
  } else {
    fetchConfig.cache = options.cache ?? "no-store";
  }

  let res: Response;
  try {
    res = await fetch(url, fetchConfig);
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

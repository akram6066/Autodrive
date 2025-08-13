// export async function absoluteFetch<T>(path: string, options?: RequestInit): Promise<T> {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

//   if (!baseUrl) {
//     throw new Error("NEXT_PUBLIC_BASE_URL is not defined in environment variables");
//   }

//   const res = await fetch(`${baseUrl}${path}`, options);
// // 
//   if (!res.ok) {
//     throw new Error(`Request failed with status ${res.status}`);
//   }

//   const data: T = await res.json();
//   return data;
// }

export async function absoluteFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("❌ NEXT_PUBLIC_BASE_URL is not defined in environment variables");
  }

  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      ...options,
    });
  } catch (networkError) {
    throw new Error(`🌐 Network error while fetching ${url}: ${(networkError as Error).message}`);
  }

  if (!res.ok) {
    throw new Error(`⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`);
  }

  try {
    const data: unknown = await res.json();
    return data as T;
  } catch (parseError) {
    throw new Error(`📦 Failed to parse JSON from ${url}: ${(parseError as Error).message}`);
  }
}

export async function absoluteFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not defined in environment variables");
  }

  const res = await fetch(`${baseUrl}${path}`, options);
// 
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const data: T = await res.json();
  return data;
}


// export async function absoluteFetch<T>(
//   path: string,
//   options?: RequestInit
// ): Promise<T> {
//   // Auto-detect base URL
//   const baseUrl =
//     process.env.NEXT_PUBLIC_BASE_URL ||
//     (typeof window === "undefined"
//       ? // Server-side: use Vercel domain if available, else localhost
//         process.env.VERCEL_URL
//           ? `https://${process.env.VERCEL_URL}`
//           : "http://localhost:3000"
//       : // Client-side: same origin
//         window.location.origin);

//   // Remove double slashes between baseUrl and path
//   if (baseUrl.endsWith("/") && path.startsWith("/")) {
//     path = path.slice(1);
//   }

//   // Debug log in development only
//   if (process.env.NODE_ENV === "development") {
//     console.log(`[absoluteFetch] Base URL: ${baseUrl}`);
//     console.log(`[absoluteFetch] Full URL: ${baseUrl}${path}`);
//   }

//   // Perform the fetch
//   const res = await fetch(`${baseUrl}${path}`, options);

//   if (!res.ok) {
//     throw new Error(`Request failed with status ${res.status}`);
//   }

//   // Parse and return JSON
//   return (await res.json()) as T;
// }

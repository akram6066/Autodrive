

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
  // 🔧 Fixed: Fallback to relative URLs for same-origin requests
  const getBaseUrl = (): string => {
    // In browser (client-side)
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || window.location.origin;
    }
    
    // In server-side (API routes, SSR, SSG)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      // Fallback for server-side when env var is missing
      console.warn("⚠️ NEXT_PUBLIC_BASE_URL not defined, using relative path");
      return "";
    }
    return baseUrl;
  };

  const baseUrl = getBaseUrl();
  
  // 🔧 Fixed: Handle both absolute and relative URLs properly
  const url = baseUrl 
    ? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
    : path.startsWith("/") ? path : `/${path}`;

  let res: Response;

  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        // 🔧 Added: Better headers for production
        'Cache-Control': 'no-cache',
        ...options?.headers,
      },
      // 🔧 Added: Production timeout and error handling
      signal: AbortSignal.timeout(30000), // 30 second timeout
      ...options,
    });
  } catch (networkError) {
    // 🔧 Enhanced: Better error handling for different error types
    if (networkError instanceof Error) {
      if (networkError.name === 'AbortError') {
        throw new Error(`⏱️ Request timeout while fetching ${url}`);
      }
      if (networkError.name === 'TypeError') {
        throw new Error(`🌐 Network error (possible CORS or connectivity issue) while fetching ${url}: ${networkError.message}`);
      }
    }
    throw new Error(`🌐 Network error while fetching ${url}: ${(networkError as Error).message}`);
  }

  if (!res.ok) {
    // 🔧 Enhanced: More detailed error information
    let errorMessage = `⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`;
    
    try {
      const errorBody = await res.text();
      if (errorBody) {
        errorMessage += `. Response: ${errorBody}`;
      }
    } catch {
      // Ignore parsing errors for error responses
    }
    
    throw new Error(errorMessage);
  }

  try {
    const data: unknown = await res.json();
    return data as T;
  } catch (parseError) {
    throw new Error(`📦 Failed to parse JSON from ${url}: ${(parseError as Error).message}`);
  }
}

// 🔧 Added: Alternative function for same-origin requests (recommended for most cases)
export async function relativeFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("/") ? path : `/${path}`;
  
  let res: Response;

  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: AbortSignal.timeout(30000),
      ...options,
    });
  } catch (networkError) {
    if (networkError instanceof Error) {
      if (networkError.name === 'AbortError') {
        throw new Error(`⏱️ Request timeout while fetching ${url}`);
      }
    }
    throw new Error(`🌐 Network error while fetching ${url}: ${(networkError as Error).message}`);
  }

  if (!res.ok) {
    let errorMessage = `⚠️ Request to ${url} failed with status ${res.status} ${res.statusText}`;
    
    try {
      const errorBody = await res.text();
      if (errorBody) {
        errorMessage += `. Response: ${errorBody}`;
      }
    } catch {
      // Ignore parsing errors
    }
    
    throw new Error(errorMessage);
  }

  try {
    const data: unknown = await res.json();
    return data as T;
  } catch (parseError) {
    throw new Error(`📦 Failed to parse JSON from ${url}: ${(parseError as Error).message}`);
  }
}

// 🔧 Added: Utility function to check if we're in development
export const isDevelopment = () => process.env.NODE_ENV === 'development';

// 🔧 Added: Smart fetch that chooses the right approach
export async function smartFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // For same-origin requests, prefer relative URLs
  if (path.startsWith('/api/') || path.startsWith('/')) {
    return relativeFetch<T>(path, options);
  }
  
  // For external URLs, use absolute fetch
  return absoluteFetch<T>(path, options);
}
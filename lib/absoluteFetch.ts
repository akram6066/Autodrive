export async function absoluteFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not defined in environment variables");
  }

  const res = await fetch(`${baseUrl}${path}`, options);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const data: T = await res.json();
  return data;
}

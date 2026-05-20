const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function fetchApi<T>(
  path: string,
  token?: string | null,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `API Error: ${res.status}`);
  }

  return json;
}

// ─── Items ────────────────────────────────────────────────

export async function getAllItems(token?: string | null) {
  return fetchApi<import("@/types").Item[]>("/item", token);
}

export async function getItemById(id: string, token?: string | null) {
  return fetchApi<import("@/types").Item>(`/item/${id}`, token);
}

export async function getItemsByCategory(categoryId: string, token?: string | null) {
  return fetchApi<import("@/types").Item[]>(`/item?categoryId=${categoryId}`, token);
}

// ─── Categories ───────────────────────────────────────────

export async function getAllCategories(token?: string | null) {
  return fetchApi<import("@/types").Category[]>("/category", token);
}

export async function getCategoryTree(token?: string | null) {
  return fetchApi<any>("/category/tree", token);
}

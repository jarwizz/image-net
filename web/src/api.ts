export type TreeResponse = {
  name: string;
  size: number;
  path: string;
  children: Array<{
    name: string;
    size: number;
    path: string;
    hasChildren: boolean;
  }>;
};

export type SearchRow = { name: string; size: number };

const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

async function get<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function fetchTree(prefix = ""): Promise<TreeResponse> {
  const u = new URL("/tree", BASE || window.location.origin);
  if (prefix) u.searchParams.set("prefix", prefix);
  u.searchParams.set("depth", "1");
  return get<TreeResponse>(u.pathname + u.search);
}

export function search(q: string, limit = 20): Promise<SearchRow[]> {
  const u = new URL("/search", BASE || window.location.origin);
  u.searchParams.set("q", q);
  u.searchParams.set("limit", String(limit));
  return get<SearchRow[]>(u.pathname + u.search);
}

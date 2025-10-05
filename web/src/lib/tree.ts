// src/lib/tree.ts
export type TreeItem = {
  name: string;
  size: number;
  path: string;
  hasChildren: boolean;
  children?: TreeItem[];
  isExpanded?: boolean;
  isLoading?: boolean;
};

export function responseToItem(r: {
  name: string;
  size: number;
  path: string;
  children: Array<{ name: string; size: number; path: string; hasChildren: boolean }>;
}): TreeItem {
  return {
    name: r.name,
    size: r.size,
    path: r.path,
    hasChildren: true,
    children: r.children.map((c) => ({
      name: c.name,
      size: c.size,
      path: c.path,
      hasChildren: c.hasChildren,
    })),
  };
}

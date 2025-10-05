import type { TreeItem } from "./tree";

export function updateNode(
  root: TreeItem,
  path: string,
  updater: (node: TreeItem) => TreeItem
): TreeItem {
  if (root.path === path) return updater(root);
  if (!root.children?.length) return root;
  return {
    ...root,
    children: root.children.map((ch) => updateNode(ch, path, updater)),
  };
}

export function setLoading(root: TreeItem, path: string, isLoading: boolean): TreeItem {
  return updateNode(root, path, (node) => ({ ...node, isLoading }));
}

export function expandWithChildren(
  root: TreeItem,
  path: string,
  newChildren: TreeItem[]
): TreeItem {
  return updateNode(root, path, (node) => ({
    ...node,
    isExpanded: true,
    isLoading: false,
    children: mergeByPath(node.children ?? [], newChildren),
  }));
}

function mergeByPath(existing: TreeItem[], incoming: TreeItem[]): TreeItem[] {
  const map = new Map(existing.map((e) => [e.path, e]));
  for (const item of incoming) {
    map.set(item.path, {
      ...(map.get(item.path) ?? {}),
      ...item,
    });
  }
  return Array.from(map.values());
}

export function setExpanded(root: TreeItem, path: string, isExpanded: boolean): TreeItem {
  return updateNode(root, path, (node) => ({ ...node, isExpanded }));
}

export function toggleExpanded(root: TreeItem, path: string): TreeItem {
  return updateNode(root, path, (node) => ({ ...node, isExpanded: !node.isExpanded }));
}

export function findNode(root: TreeItem | null, path: string): TreeItem | null {
  if (!root) return null;
  if (root.path === path) return root;
  for (const ch of root.children ?? []) {
    const f = findNode(ch, path);
    if (f) return f;
  }
  return null;
}

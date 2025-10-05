import { useEffect, useState } from "react";
import { fetchTree } from "../api";
import { responseToItem, type TreeItem } from "../lib/tree";
import { expandWithChildren, setLoading, setExpanded, findNode } from "../lib/treeOps";

export function useTreeData() {
  const [root, setRoot] = useState<TreeItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    fetchTree("")
      .then((data) => {
        if (!alive) return;
        setRoot(responseToItem(data));
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  const expandNode = (path: string): Promise<void> =>
    new Promise((resolve) => {
      setRoot((r) => {
        if (!r) return r;

        const existing = findNode(r, path);

        if (existing && existing.isExpanded && (existing.children?.length ?? 0) > 0) {
          setTimeout(resolve, 0);
          return r;
        }

        if (existing && (existing.children?.length ?? 0) > 0 && !existing.isExpanded) {
          const opened = setExpanded(r, path, true);
          setTimeout(resolve, 0);
          return opened;
        }

        return setLoading(r, path, true);
      });

      fetchTree(path)
        .then((res) => {
          const children = res.children.map((c) => ({
            name: c.name,
            size: c.size,
            path: c.path,
            hasChildren: c.hasChildren,
          }));
          setRoot((r) => (r ? expandWithChildren(r, path, children) : r));
        })
        .finally(() => resolve());
    });

  const collapseNode = (path: string) => {
    setRoot((r) => (r ? setExpanded(r, path, false) : r));
  };

  return { root, error, expandNode, collapseNode, setRoot, setError };
}

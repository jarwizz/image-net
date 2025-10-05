import { useRef } from "react";
import type { TreeItem } from "../lib/tree";
import { SEPARATOR } from "../constants";

export function useOpenPath(
  root: TreeItem | null,
  expandNode: (path: string) => Promise<void>
) {
  const highlightedRef = useRef<HTMLElement | null>(null);

  const cssAttr = (v: string) => v.replace(/"/g, '\\"');

  const openPath = async (fullPath: string) => {
    if (!fullPath || !root) return;

    const parts = fullPath
      .split(SEPARATOR)
      .map((s) => s.trim())
      .filter(Boolean);

    const prefixes: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      prefixes.push(parts.slice(0, i + 1).join(SEPARATOR));
    }

    for (const p of prefixes) {
      await expandNode(p);
    }

    requestAnimationFrame(() => {
      if (highlightedRef.current) {
        highlightedRef.current.classList.remove("tw-highlight-hit");
      }
      const el = document.querySelector<HTMLElement>(
        `[data-path="${cssAttr(fullPath)}"]`
      );
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.classList.add("tw-highlight-hit");
        highlightedRef.current = el;
      }
    });
  };

  const clearHighlight = () => {
    if (highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.classList.remove("tw-highlight-hit");
        highlightedRef.current = null;
      }, 5000);
    }
  };

  return { openPath, clearHighlight };
}

// src/components/TreeView.tsx
import type { TreeItem } from "../lib/tree";
import TreeNode from "./TreeNode";

type Props = {
  root: TreeItem | null;
  error: string | null;
  onExpand: (path: string) => void;
  onCollapse: (path: string) => void;
};

export default function TreeView({ root, error, onExpand, onCollapse }: Props) {
  return (
    <div
      style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 12,
          background: "#f9fafb",
        }}
      >
        <div style={{ fontWeight: 600 }}>{root?.name ?? "—"}</div>
        <div style={{ opacity: 0.8 }}>size: {root?.size ?? "—"}</div>
      </div>

      {error && (
        <div
          style={{
            color: "#b91c1c",
            padding: 12,
            fontSize: 14,
            background: "#fff1f2",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ padding: 8 }}>
        {!root && !error && <div style={{ padding: 12 }}>Loading…</div>}
        {root && (
          <div style={{ padding: 4 }}>
            <TreeNode
              node={root}
              level={0}
              onExpand={onExpand}
              onCollapse={onCollapse}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import type { TreeResponse } from "../api";

type Props = {
  node: TreeResponse | null;
  loading: boolean;
  error: string | null;
  onOpenChild: (path: string) => void;
};

export default function NodePanel({
  node,
  loading,
  error,
  onOpenChild,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 12,
          background: "#f9fafb",
        }}
      >
        <div style={{ fontWeight: 600 }}>
          {loading ? "Loading…" : node?.name || "—"}
        </div>
        <div style={{ opacity: 0.8 }}>size: {node?.size ?? "—"}</div>
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
        {!node && !error && <div style={{ padding: 12 }}>Loading…</div>}
        {node && node.children.length === 0 && (
          <div style={{ padding: 12, opacity: 0.6 }}>No children</div>
        )}
        {node &&
          node.children.map((child) => (
            <div
              key={child.path}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f1f1f1",
                padding: "10px 6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {child.hasChildren ? (
                  <button
                    onClick={() => onOpenChild(child.path)}
                    style={{
                      border: "1px solid #ddd",
                      background: "#fff",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    Open
                  </button>
                ) : (
                  <span
                    style={{
                      border: "1px solid #eee",
                      background: "#fafafa",
                      borderRadius: 6,
                      padding: "4px 8px",
                      opacity: 0.6,
                    }}
                  >
                    Leaf
                  </span>
                )}
                <div style={{ fontWeight: 500, margin: "0 20px 0 0" }}>
                  {child.name}
                </div>
              </div>
              <div style={{ fontVariantNumeric: "tabular-nums" }}>
                {child.size}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

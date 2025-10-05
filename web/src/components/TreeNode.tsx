import type { TreeItem } from "../lib/tree";

const TreeNode = ({
  node,
  level,
  onExpand,
  onCollapse,
}: {
  node: TreeItem;
  level: number;
  onExpand: (path: string) => void;
  onCollapse: (path: string) => void;
}) => {
  const padLeft = 10;
  const leaf = !node.hasChildren;

  return (
    <div style={{ marginBottom: 2 }} data-path={node.path}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 6px",
          borderBottom: "1px solid #f1f1f1",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div style={{ minWidth: 14 }}>
            {!leaf && (
              <button
                onClick={() =>
                  node.isExpanded ? onCollapse(node.path) : onExpand(node.path)
                }
                disabled={node.isLoading}
                style={{
                  border: "1px solid #ddd",
                  background: node.isExpanded ? "#f3f4f6" : "#fff",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                  opacity: node.isLoading ? 0.6 : 1,
                }}
                title={node.isExpanded ? "-" : "+"}
              >
                {node.isLoading ? "…" : node.isExpanded ? "-" : "+"}
              </button>
            )}
          </div>

          <div style={{ fontWeight: 500, textAlign: "left" }}>
            {node.name.split(" > ").pop() || node.name}
          </div>
        </div>

        <div
          style={{
            fontVariantNumeric: "tabular-nums",
            minWidth: 60,
            textAlign: "right",
          }}
        >
          {node.size}
        </div>
      </div>

      {node.isExpanded && node.children?.length ? (
        <div style={{ marginLeft: padLeft, borderLeft: "1px dashed #eee" }}>
          {node.children.map((ch) => (
            <TreeNode
              key={ch.path}
              node={ch}
              level={level + 1}
              onExpand={onExpand}
              onCollapse={onCollapse}
            />
          ))}
        </div>
      ) : null}

      {node.isExpanded &&
        !node.isLoading &&
        (!node.children || node.children.length === 0) &&
        null}
    </div>
  );
};

export default TreeNode;

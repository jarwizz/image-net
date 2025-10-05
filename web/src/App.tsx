import { useTreeData } from "./hooks/useTreeData";
import { useOpenPath } from "./hooks/useOpenPath.ts";
import SearchBox from "./components/SearchBox";
import TreeView from "./components/TreeView";
import "./App.css";

export default function App() {
  const { root, error, expandNode, collapseNode } = useTreeData();
  const { openPath, clearHighlight } = useOpenPath(root, expandNode);

  return (
    <div style={{ margin: "0 auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>ImageNet Taxonomy Explorer</h1>
      </header>

      <SearchBox
        onSelect={(path) => openPath(path)}
        onClearHighlight={clearHighlight}
      />

      <TreeView
        root={root}
        error={error}
        onExpand={expandNode}
        onCollapse={collapseNode}
      />

      <footer style={{ marginTop: 16, fontSize: 12, opacity: 0.5 }}>
        Tip: Click “Open” to append children under a node. Already opened
        branches stay visible.
      </footer>
    </div>
  );
}

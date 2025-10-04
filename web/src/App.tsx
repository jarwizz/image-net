import { useEffect, useState } from "react";
import { fetchTree, type TreeResponse } from "./api";
import SearchBox from "./components/SearchBox";
import Breadcrumbs from "./components/Breadcrumbs";
import NodePanel from "./components/NodePanel";
import "./App.css";

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [node, setNode] = useState<TreeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchTree(currentPath)
      .then((data) => {
        if (!alive) return;
        setNode(data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [currentPath]);

  const onOpenChild = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>ImageNet Taxonomy Explorer</h1>
        <span style={{ fontSize: 12, opacity: 0.6 }}>
          API: {import.meta.env.VITE_API_URL || "relative"}
        </span>
      </header>

      <SearchBox onSelect={onOpenChild} />
      <Breadcrumbs
        currentPath={currentPath}
        rootName={node?.name}
        rootPath={node?.path}
        onOpen={onOpenChild}
      />
      <NodePanel
        node={node}
        loading={loading}
        error={error}
        onOpenChild={onOpenChild}
      />

      <footer style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
        Tip: use search to jump directly to any path, then click “Open” to
        explore deeper.
      </footer>
    </div>
  );
}

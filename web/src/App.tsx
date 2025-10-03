// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { fetchTree, search, type TreeResponse, type SearchRow } from "./api";
import "./App.css";

const SEPARATOR = " > ";

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [node, setNode] = useState<TreeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [results, setResults] = useState<SearchRow[]>([]);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (!dq) {
      setResults([]);
      return;
    }
    let alive = true;
    search(dq, 20)
      .then((rows) => alive && setResults(rows))
      .catch(() => alive && setResults([]));
    return () => {
      alive = false;
    };
  }, [dq]);

  const crumbs = useMemo(() => {
    if (currentPath) return currentPath.split(SEPARATOR);
    if (node?.name) return [node.name];
    return [];
  }, [currentPath, node?.name]);

  const onOpenChild = (path: string) => {
    setCurrentPath(path);
    setSearchOpen(false);
    setQ("");
    setResults([]);
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

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => q && setSearchOpen(true)}
          placeholder="Search anything (e.g. phytoplankton)…"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            outline: "none",
          }}
        />
        {searchOpen && q && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
              maxHeight: 320,
              overflow: "auto",
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              zIndex: 10,
            }}
          >
            {results.length === 0 ? (
              <div style={{ padding: 12, fontSize: 14, opacity: 0.6 }}>
                No matches
              </div>
            ) : (
              results.map((r) => (
                <div
                  key={r.name}
                  onClick={() => onOpenChild(r.name)}
                  style={{
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div style={{ fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    size: {r.size}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Breadcrumbs */}
      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <span style={{ opacity: 0.6 }}>Path: </span>
        {crumbs.map((c, i) => {
          const target =
            (currentPath || node?.path || "")
              .split(SEPARATOR)
              .slice(0, i + 1)
              .join(SEPARATOR) || c;
          return (
            <span key={i}>
              {i > 0 && " / "}
              <button
                onClick={() => onOpenChild(target)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#2563eb",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            </span>
          );
        })}
      </div>

      {/* Node panel */}
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
                  <div style={{ fontWeight: 500 }}>{child.name}</div>
                </div>
                <div style={{ fontVariantNumeric: "tabular-nums" }}>
                  {child.size}
                </div>
              </div>
            ))}
        </div>
      </div>

      <footer style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
        Tip: use search to jump directly to any path, then click “Open” to
        explore deeper.
      </footer>
    </div>
  );
}

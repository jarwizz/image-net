import { useEffect, useState } from "react";
import { search, type SearchRow } from "../api";
import { useDebounced } from "../hooks/useDebounced";

type Props = {
  onSelect: (path: string) => void;
};

export default function SearchBox({ onSelect }: Props) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [results, setResults] = useState<SearchRow[]>([]);
  const [open, setOpen] = useState(false);

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

  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => q && setOpen(true)}
        placeholder="Search anything (e.g. phytoplankton)…"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
          outline: "none",
        }}
      />
      {open && q && (
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
                onClick={() => {
                  onSelect(r.name);
                  setOpen(false);
                  setQ("");
                  setResults([]);
                }}
                style={{
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div style={{ fontSize: 14 }}>
                  {r.name.split(">").pop() || r.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>size: {r.size}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

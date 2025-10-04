import { SEPARATOR } from "../constants";

type Props = {
  currentPath: string;
  rootName?: string;
  rootPath?: string;
  onOpen: (targetPath: string) => void;
};

export default function Breadcrumbs({
  currentPath,
  rootName,
  rootPath,
  onOpen,
}: Props) {
  const crumbs = currentPath
    ? currentPath.split(SEPARATOR)
    : rootName
    ? [rootName]
    : [];

  return (
    <div style={{ marginBottom: 12, fontSize: 14 }}>
      <span style={{ opacity: 0.6 }}>Path: </span>
      {crumbs.map((c, i) => {
        const target =
          (currentPath || rootPath || "")
            .split(SEPARATOR)
            .slice(0, i + 1)
            .join(SEPARATOR) || c;

        return (
          <span key={i}>
            {i > 0 && SEPARATOR}
            <button
              onClick={() => onOpen(target)}
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
  );
}

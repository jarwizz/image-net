import type { LinearRow } from "./db";
import type { RawSynset } from "./types";
import { children } from "./taxonomy";

const SEP = " > ";

export const flattenWithSizes = (
  node: RawSynset,
  wnids: string[] = [],
  words: string[] = []
): { rows: LinearRow[]; subtreeCount: number; leafCount: number } => {
  const wnid = (node.wnid ?? "").trim();
  const label = (node.words ?? "").trim();

  const nextWnids = wnid ? [...wnids, wnid] : wnids;
  const nextWords = label ? [...words, label] : words;

  const kids = children(node);

  let rows: LinearRow[] = [];
  let subtreeCount = 1;
  let leafCount = 0;

  if (kids.length === 0) {
    leafCount = 1;
  } else {
    for (const c of kids) {
      const r = flattenWithSizes(c, nextWnids, nextWords);
      rows.push(...r.rows);
      subtreeCount += r.subtreeCount;
      leafCount += r.leafCount;
    }
  }

  if (wnid && label) {
    const fullPath = nextWords.join(SEP);
    rows.unshift({ wnid, name: fullPath, size: subtreeCount - 1 });
  }

  return { rows, subtreeCount, leafCount };
};

import { SEP } from "./constants";
import type { RawSynset } from "./types";

export const children = (n: RawSynset): RawSynset[] => {
  const s = n.synset;
  return !s ? [] : Array.isArray(s) ? s : [s];
};

export const joinPath = (parts: string[]): string => {
  const cleaned = parts.filter(Boolean);
  return cleaned.length ? cleaned.join(SEP) : "(root)";
};

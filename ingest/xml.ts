import { XMLParser } from "fast-xml-parser";
import type { RawSynset } from "./types";

export const parseXml = (xml: string): any => {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  return parser.parse(xml);
};

export const getRoot = (parsed: any): RawSynset => {
  if (parsed?.ImageNetStructure?.synset) return parsed.ImageNetStructure.synset;
  if (parsed?.structure?.synset) return parsed.structure.synset;
  if (parsed?.synset) return parsed.synset;
  throw new Error("Could not find <synset> root in XML.");
};

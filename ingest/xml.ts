import { XMLParser } from "fast-xml-parser";

const XML_URL =
  "https://raw.githubusercontent.com/tzutalin/ImageNet_Utils/master/detection_eval_tools/structure_released.xml";

export async function downloadAndParseXML() {
  const res = await fetch(XML_URL);
  if (!res.ok)
    throw new Error(`Failed to download XML: ${res.status} ${res.statusText}`);
  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  return parser.parse(xml);
}

export function getRootSynset(parsed: any) {
  if (parsed?.structure?.synset) return parsed.structure.synset;
  if (parsed?.ImageNetStructure?.synset) return parsed.ImageNetStructure.synset;
  if (parsed?.synset) return parsed.synset;
  for (const v of Object.values(parsed ?? {})) {
    if (v && typeof v === "object" && (v as any).synset) return (v as any).synset;
  }
  throw new Error("Could not locate <synset> root in XML.");
}

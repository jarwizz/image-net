import {
  connectOrCreateDb,
  ensureSchema,
  insertData,
} from "./db";
import { XML_URL } from "./constants";
import { parseXml, getRoot } from "./xml";
import { flattenWithSizes } from "./flatten";

const main = async () => {
  console.log("Downloading ImageNet XML…");
  const res = await fetch(XML_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const xml = await res.text();

  console.log("Parsing XML…");
  const parsed = parseXml(xml);
  const root = getRoot(parsed);

  console.log("Flattening taxonomy…");
  const { rows, subtreeCount } = flattenWithSizes(root, [], []);
  console.log(`Flattened ${rows.length} synset nodes (root subtreeCount=${subtreeCount}).`);

  console.log("Ensuring database & schema…");
  const client = await connectOrCreateDb();
  try {
    await ensureSchema(client);
    await insertData(client, rows);
    console.log("✅ Ingest complete.");
  } finally {
    await client.end();
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

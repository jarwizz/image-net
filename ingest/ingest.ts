import { downloadAndParseXML, getRootSynset } from "./xml.ts";
import { upsertRows, ensureTable, connectDb } from "./db.ts";

const SEP = " > ";
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 500;

type RawSynset = {
  synset?: RawSynset | RawSynset[];
  wnid?: string;
  words?: string;
  gloss?: string;
  num_of_images?: string | number;
  num_images?: string | number;
};

type LinearRow = { path: string; size: number };

const kids = (n: RawSynset) =>
  !n.synset ? [] : Array.isArray(n.synset) ? n.synset : [n.synset];

function* walk(node: RawSynset, chain: string[]): Generator<LinearRow> {
  const name = (node.words ?? "").trim();
  if (name) {
    const sizeRaw = node.num_of_images ?? node.num_images ?? 0;
    const size = Number(sizeRaw) || 0;
    yield { path: [...chain, name].join(SEP), size };
  }
  for (const c of kids(node)) yield* walk(c, [...chain, node.words ?? ""]);
}

async function main() {
  const start = Date.now();
  console.log("Downloading and parsing ImageNet XML…");
  const parsed = await downloadAndParseXML();
  const root = getRootSynset(parsed);

  console.log("Flattening taxonomy…");
  const raw = [...walk(root, [])];
  console.log(`Flattened ${raw.length} nodes.`);

  console.log("Normalizing & de-duplicating…");
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  const map = new Map<string, { path: string; size: number }>();
  for (const r of raw) {
    const p = normalize(r.path);
    const prev = map.get(p);
    map.set(p, !prev ? { path: p, size: r.size } : { path: p, size: Math.max(prev.size, r.size) });
  }
  const rows = [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
  console.log(`Unique rows: ${rows.length}`);

  const client = await connectDb();
  process.on("SIGINT", async () => {
    await client.end();
    process.exit();
  });

  await ensureTable(client);

  console.log(`Upserting rows in batches of ${BATCH_SIZE}…`);
  await upsertRows(client, rows, BATCH_SIZE);

  await client.end();
  console.log(`Ingest complete. (${((Date.now() - start) / 1000).toFixed(1)}s)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
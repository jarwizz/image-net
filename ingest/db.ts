import pg from "pg";

export async function connectDb() {
  const connStr =
    process.env.DATABASE_URL ?? "postgres://postgres:postgres@db:5432/imagenet";
  console.log(`Connecting to Postgres… (${connStr})`);
  const client = new pg.Client({ connectionString: connStr });
  await client.connect();
  return client;
}

export async function ensureTable(client: pg.Client) {
  await client.query(`
    create table if not exists imagenet_paths (
      id bigserial primary key,
      path text not null unique,
      size int not null
    );
  `);
  await client.query(
    `create index if not exists idx_imagenet_paths_path on imagenet_paths(path);`
  );
}

export async function upsertRows(
  client: pg.Client,
  rows: { path: string; size: number }[],
  batchSize: number
) {
  await client.query("BEGIN");
  try {
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const values = batch.flatMap((r) => [r.path, r.size]);
      const sql = `
        insert into imagenet_paths (path, size)
        values ${batch
          .map((_, j) => `($${j * 2 + 1}, $${j * 2 + 2})`)
          .join(",")}
        on conflict (path) do update set size = excluded.size
      `;
      await client.query(sql, values);
      if ((i + batch.length) % 2000 === 0)
        console.log(`  … ${i + batch.length}/${rows.length}`);
    }
    await client.query("COMMIT");
    console.log(`[PASSED] Upserted ${rows.length} rows.`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("[ERROR] Upsert failed, rolled back.", e);
    throw e;
  }
}

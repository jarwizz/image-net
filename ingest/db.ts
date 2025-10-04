import pg from "pg";

export type LinearRow = {
  wnid: string;
  name: string;
  size: number;
};

export const parsePgUrl = (url: string) => {
  const u = new URL(url);
  if (u.protocol !== "postgres:" && u.protocol !== "postgresql:") {
    throw new Error(`Unsupported protocol: ${u.protocol}`);
  }
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "postgres",
  };
};

export const connectOrCreateDb = async (): Promise<pg.Client> => {
  const connStr =
    process.env.DATABASE_URL ?? "postgres://postgres:postgres@db:5432/imagenet";
  const cfg = parsePgUrl(connStr);

  let client = new pg.Client({ connectionString: connStr });
  try {
    await client.connect();
    console.log(`Connected to Postgres db "${cfg.database}" on ${cfg.host}:${cfg.port}`);
    return client;
  } catch (err: any) {
    if (err?.code !== "3D000") throw err;

    console.log(`Database "${cfg.database}" not found, creating…`);
    const adminUrl = new URL(connStr);
    adminUrl.pathname = "/postgres";
    const admin = new pg.Client({ connectionString: adminUrl.toString() });
    await admin.connect();
    try {
      await admin.query(`create database "${cfg.database}";`);
      console.log(`Created database "${cfg.database}".`);
    } finally {
      await admin.end();
    }

    client = new pg.Client({ connectionString: connStr });
    await client.connect();
    console.log(`Connected to Postgres db "${cfg.database}" on ${cfg.host}:${cfg.port}`);
    return client;
  }
};

export const ensureSchema = async (client: pg.Client): Promise<void> => {
  // destructive recreate is simplest when changing PKs/columns
  await client.query(`DROP TABLE IF EXISTS imagenet_paths;`);
  await client.query(`
    CREATE TABLE imagenet_paths (
      id   BIGSERIAL PRIMARY KEY,
      wnid TEXT    NOT NULL,
      name TEXT    NOT NULL,
      size INT     NOT NULL
    );
  `);

  await client.query(`CREATE INDEX IF NOT EXISTS idx_paths_wnid ON imagenet_paths(wnid);`);

  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_paths_name_trgm
      ON imagenet_paths USING gin (name gin_trgm_ops);
    `);
  } catch {
    // pg_trgm may be unavailable; ignore
  }
};

export const insertData = async (
  client: pg.Client,
  rows: LinearRow[],
  batchSize = 1000
) => {
  await client.query("BEGIN");
  try {
    await client.query(`TRUNCATE TABLE imagenet_paths;`);

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      if (batch.length === 0) continue;

      const values = batch.flatMap(r => [r.wnid, r.name, r.size]);
      const placeholders = batch
        .map((_, j) => `($${3*j+1},$${3*j+2},$${3*j+3})`)
        .join(",");

      await client.query(
        `INSERT INTO imagenet_paths (wnid, name, size) VALUES ${placeholders}`,
        values
      );
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
};


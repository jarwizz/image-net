-- drop old table if you don't need it (optional but simplest)
DROP TABLE IF EXISTS imagenet_paths;

-- recreate with an auto ID and no PK on wnid
CREATE TABLE imagenet_paths (
  id   BIGSERIAL PRIMARY KEY,
  wnid TEXT    NOT NULL,
  name TEXT    NOT NULL,
  size INT     NOT NULL
);

-- helpful indexes (non-unique)
CREATE INDEX IF NOT EXISTS idx_paths_wnid ON imagenet_paths(wnid);

-- optional: fast fuzzy search by name
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_paths_name_trgm
  ON imagenet_paths USING gin (name gin_trgm_ops);

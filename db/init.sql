DROP TABLE IF EXISTS imagenet_paths;

CREATE TABLE imagenet_paths (
  id   BIGSERIAL PRIMARY KEY,
  wnid TEXT    NOT NULL,
  name TEXT    NOT NULL,
  size INT     NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paths_wnid ON imagenet_paths(wnid);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_paths_name_trgm
  ON imagenet_paths USING gin (name gin_trgm_ops);

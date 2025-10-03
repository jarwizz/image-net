create table if not exists imagenet_paths (
  id bigserial primary key,
  path text not null unique,
  size integer not null
);
create index if not exists idx_imagenet_paths_path on imagenet_paths(path);


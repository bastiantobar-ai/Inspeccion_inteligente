-- Inspección Inteligente — schema inicial
-- Correr una sola vez en el SQL Editor de Supabase antes de importar los CSV.

create table catalogo (
  id          bigserial primary key,
  sku         uuid,
  old_sku     text,
  marca       text,
  modelo      text,
  version     text,
  anio        int,
  aux_sku     text,
  transmision text,
  combustible text,
  bodytype    text,
  doors       int,
  traccion    text
);

create table insp_dif (
  id             bigserial primary key,
  sku            uuid,
  aux_sku        text,
  version_corta  text,
  kms_inspe_plus int,
  link           text
);

create table ots (
  id             bigserial primary key,
  stock_id       text,
  workshop_name  text,
  work_item_name text,
  km             int,
  aux_sku        text,
  match_old_sku  text,
  sku            uuid
);

create table cangrejos (
  id            bigserial primary key,
  stock_id      text,
  patente       text,
  km            int,
  aux_sku       text,
  match_old_sku text,
  sku           uuid
);

create table devoluciones (
  id            bigserial primary key,
  patente       text,
  descripcion   text,
  aux_sku       text,
  match_old_sku text,
  sku           uuid
);

create table alertas_motor (
  id    bigserial primary key,
  motor text,
  link  text
);

-- Índices: correr DESPUÉS de importar los datos (más rápido así)
-- create index on catalogo (aux_sku);
-- create index on catalogo (marca, modelo, version, anio);
-- create index on insp_dif (aux_sku);
-- create index on ots (aux_sku);
-- create index on cangrejos (aux_sku);
-- create index on devoluciones (aux_sku);

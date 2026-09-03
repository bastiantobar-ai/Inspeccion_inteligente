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

-- OT de devolución (fuente: hoja "OT devolución" del ERP,
-- "CL - KAOS BBDD - OT devolución"). Una fila por evento de devolución
-- (work_item_name = 'DEVOLUCION'). Trae Aux_SKU ya armado
-- (MARCA-MODELO-VERSION-AÑO), igual que ots/cangrejos, así que el
-- histórico por marca+modelo se calcula con LIKE (RPC devoluciones_grupo
-- en funciones_riesgo.sql). Reemplazo completo en cada sync.
create table devoluciones_ot (
  id             bigserial primary key,
  stock_id       text,
  workshop_name  text,
  work_item_name text,
  marca          text,
  modelo         text,
  anio           int,
  version        text,
  km             int,
  aux_sku        text,
  match_old_sku  text,
  sku            text,
  marca_modelo   text
);

-- IQI por marca (fuente: hoja "IQI" del ERP, "CL - KAOS BBDD - IQI").
-- Una fila por marca con su grado A-E YA calculado aguas arriba. El
-- código NO recalcula el grado de marca: lo lee de acá vía la RPC
-- grado_iqi_marca() (ver funciones_riesgo.sql) y con eso arma el IQI
-- junto con los factores de año y km (lib/iqi.ts). Se sincroniza por
-- reemplazo completo en cada sync — esta base se va actualizando.
create table iqi_marca (
  id    bigserial primary key,
  marca text,
  grado text   -- 'A' | 'B' | 'C' | 'D' | 'E'
);

-- Inventario completo (fuente: "CL - KAOS BBDD - ERP.csv"): una fila
-- por auto, sin importar si pasó o no por taller. Es el universo real
-- para calcular tasas (denominador correcto de tasa_cangrejo_grupo en
-- funciones_riesgo.sql) — a diferencia de `ots`, que solo tiene los
-- autos que generaron al menos una orden de trabajo.
--
-- El CSV no trae aux_sku armado (a diferencia de ots/cangrejos), así
-- que se calcula solo vía columna generada.
create table stock (
  id                   bigserial primary key,
  stock_id             text,
  marca                text,
  modelo               text,
  anio                 int,
  version              text,
  km                   int,
  patente              text,
  inventory_status     text,
  motivo               text,
  sku                  uuid,
  bucket_stock_tracker text,
  -- coalesce(version,'') es obligatorio: '||' con NULL en cualquier
  -- lado anula TODA la concatenación en SQL. Sin esto, cualquier auto
  -- con version=NULL queda con aux_sku=NULL y desaparece de todo LIKE
  -- que lo busque (bug real: BMW Serie 1 daba 45 autos en vez de 65,
  -- los 21 sin versión no matcheaban nunca).
  aux_sku text generated always as (
    marca || '-' || modelo || '-' || coalesce(version, '') || '-' || anio::text
  ) stored
);

-- Índices: correr DESPUÉS de importar los datos (más rápido así)
-- create index on catalogo (aux_sku);
-- create index on catalogo (marca, modelo, version, anio);
-- create index on insp_dif (aux_sku);
-- create index on ots (aux_sku);
-- create index on cangrejos (aux_sku);
-- create index on devoluciones (aux_sku);
-- create index on stock (aux_sku);
-- create index on stock (upper(stock_id));
-- create index on iqi_marca (upper(translate(trim(marca), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu')));
-- create index on devoluciones_ot (upper(aux_sku) text_pattern_ops);

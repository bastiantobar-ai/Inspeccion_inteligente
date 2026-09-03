-- ============================================================
-- Inspección Inteligente — funciones de riesgo
-- Correr COMPLETO en el SQL Editor de Supabase (reemplaza las
-- versiones anteriores de top_ots_grupo).
-- ============================================================

-- ------------------------------------------------------------
-- 0) Inspección Diferenciada.
--
--    Reportado: "no me está indicando inspección diferenciada cuando
--    corresponde". Dos causas encontradas:
--
--    a) insp_dif_grupo NO EXISTE en ningún archivo de este repo — no
--       se creó en esta sesión. O no existe en Supabase (el checklist
--       fallaba en silencio, ver más abajo), o existe con otra lógica
--       nunca revisada. Se crea acá de cero.
--
--    b) El camino CON versión usaba .eq('aux_sku', fullAuxSku) en
--       route.ts — igualdad exacta de string, frágil.
--
-- 0a) Vista insp_dif_sin_version — visible y consultable directo
--     en el Table Editor de Supabase, no escondida dentro de una
--     función. Una fila por marca+modelo+año, con el umbral MÁS
--     BAJO entre las versiones de ese grupo (lectura conservadora:
--     si alguna versión requiere inspección diferenciada a cierto
--     km, mejor advertirlo aunque no se conozca la versión exacta).
--
--     Se agrupa vía `catalogo` (marca/modelo/año en columnas
--     limpias) en vez de parsear insp_dif.aux_sku por posición —
--     mismo motivo que en top_ots_grupo: modelos con guión propio
--     (ej "F3-R") rompen cualquier split por '-'.
-- ------------------------------------------------------------
create or replace view insp_dif_sin_version as
select
  c.marca,
  c.modelo,
  c.anio,
  min(i.kms_inspe_plus) as kms_inspe_plus,
  (array_agg(i.link order by i.kms_inspe_plus asc nulls last))[1] as link,
  count(*) as versiones_consideradas
from insp_dif i
join catalogo c on upper(c.aux_sku) = upper(i.aux_sku)
group by c.marca, c.modelo, c.anio
order by c.marca, c.modelo, c.anio;

-- 0b) Función que usa la app: exacta con versión, vista sin ella.
drop function if exists insp_dif_grupo(text, text, text);
drop function if exists insp_dif_grupo(text, text, int, text);

create or replace function insp_dif_grupo(
  p_marca   text,
  p_modelo  text,
  p_anio    int  default null,
  p_version text default null
)
returns table(kms_inspe_plus int, link text)
language plpgsql stable as $$
begin
  if p_version is not null and trim(p_version) <> '' and p_anio is not null then
    return query
      select i.kms_inspe_plus, i.link
      from insp_dif i
      where upper(i.aux_sku) = upper(
        trim(p_marca) || '-' || trim(p_modelo) || '-' || trim(p_version) || '-' || p_anio::text
      )
      limit 1;
  else
    return query
      select v.kms_inspe_plus, v.link
      from insp_dif_sin_version v
      where upper(v.marca) = upper(trim(p_marca))
        and upper(v.modelo) = upper(trim(p_modelo))
        and (p_anio is null or v.anio = p_anio)
      order by v.kms_inspe_plus asc nulls last
      limit 1;
  end if;
end;
$$;


-- ------------------------------------------------------------
-- 0c) Grado IQI de la marca (o marca-modelo) — LOOKUP, no cálculo.
--
--     El grado A-E se calcula aguas arriba en la hoja "IQI" del ERP
--     y se carga en dos tablas: `iqi_marca` (por marca) e
--     `iqi_marca_modelo` (solo las combinaciones con significancia
--     propia). lib/iqi.ts NO calcula nada de marca: trae el grado con
--     esta función y arma el IQI con los factores de año y km.
--
--     Cascada (la primera que matchea gana):
--       1) iqi_marca_modelo, si se pasó p_modelo y hay match para
--          "MARCA-MODELO"  (ej. Hyundai-Accent = B aunque Hyundai = B,
--          o Chevrolet-Tracker = C aunque Chevrolet = D)
--       2) iqi_marca, por marca
--       3) 'C'  — factor neutro, para marcas sin clasificar
--          (ej. Alfa Romeo, Porsche). lib/iqi.ts tiene el mismo
--          default por si la RPC falla del todo.
--
--     Todos los match son case- y acento-insensibles.
-- ------------------------------------------------------------
drop function if exists grado_iqi_marca(text);
drop function if exists grado_iqi_marca(text, text);

create or replace function grado_iqi_marca(p_marca text, p_modelo text default null)
returns text
language sql stable as $$
  select coalesce(
    -- 1) grado específico marca-modelo
    (
      select imm.grado
      from iqi_marca_modelo imm
      where p_modelo is not null and trim(p_modelo) <> ''
        and upper(translate(trim(imm.marca_modelo), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))
          = upper(translate(trim(p_marca) || '-' || trim(p_modelo), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))
      limit 1
    ),
    -- 2) grado de la marca
    (
      select im.grado
      from iqi_marca im
      where upper(translate(trim(im.marca), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))
          = upper(translate(trim(p_marca), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))
      limit 1
    ),
    -- 3) fallback
    'C'
  );
$$;


-- ------------------------------------------------------------
-- 0d) Histórico de devoluciones del grupo Marca+Modelo.
--
--     Fuente: tabla `devoluciones_ot` (hoja "OT devolución" del ERP),
--     una fila por evento de devolución. Se matchea por marca+modelo
--     con LIKE sobre aux_sku — MISMO criterio que top_ots_grupo /
--     tasa_cangrejo_grupo, NO igualdad a 4 factores (que casi siempre
--     da 0). Así el histórico sale más completo, sin depender de que
--     la versión/año coincidan exacto.
--
--     Devuelve:
--       total_devoluciones = # de eventos (un auto devuelto 2 veces = 2)
--       autos_devueltos    = # de autos distintos devueltos
--       autos_grupo        = universo del modelo en `stock`
--       pct_autos          = autos_devueltos / autos_grupo × 100
-- ------------------------------------------------------------
drop function if exists devoluciones_grupo(text, text);
drop function if exists devoluciones_grupo(text, text, text);

create or replace function devoluciones_grupo(p_marca text, p_modelo text)
returns table(
  total_devoluciones bigint,
  autos_devueltos    bigint,
  autos_grupo        bigint,
  pct_autos          numeric
)
language sql stable as $$
  with universo as (
    select count(distinct s.stock_id)::bigint as n
    from stock s
    where upper(s.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
  ),
  dev as (
    select d.stock_id
    from devoluciones_ot d
    where upper(d.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
  )
  select
    (select count(*) from dev)::bigint,
    (select count(distinct stock_id) from dev)::bigint,
    (select n from universo),
    round(
      100.0 * (select count(distinct stock_id) from dev)
      / nullif((select n from universo), 0)
    , 1);
$$;


-- ------------------------------------------------------------
-- 1) TOP 10 fallas del grupo Marca+Modelo
--
--    Match por MARCA+MODELO (todos los años y versiones), igual que
--    tasa_cangrejo_grupo y devoluciones_grupo — histórico completo.
--    Antes filtraba también por año/versión y casi siempre daba 0.
--
--    Mide INCIDENCIA, no conteo crudo:
--
--      pct_autos = autos distintos con esa falla
--                / total de autos del modelo (tabla `stock`)
--
--    Por qué: "FILTRO DE ACEITE (10)" no dice nada sin saber si el
--    modelo tiene 12 autos o 500. 10 de 12 (83%) es sistemático;
--    10 de 500 (2%) es anecdótico.
--
--    Numerador: count(DISTINCT stock_id), no count(*). Un auto que
--    volvió 3 veces por lo mismo cuenta como 1 auto afectado. El
--    total de OTs se devuelve igual como contexto.
--
--    Denominador: `stock` (inventario completo), no los autos con
--    OTs — si no, la incidencia daría siempre altísima.
--
--    Por qué LIKE 'MARCA-MODELO-%' y no split_part por posición: hay
--    modelos con guión propio (ej "F3-R" en "BYD-F3-R-1.5 GLI-2014").
--    split_part(aux_sku,'-',2) agarraba solo "F3" y nunca calzaba.
--    El modelo va literal dentro del patrón, así que no importa
--    cuántos guiones tenga.
-- ------------------------------------------------------------
-- Se dropean TODAS las firmas anteriores. Postgres permite sobrecargas,
-- así que un create or replace con distinta firma no reemplaza: deja las
-- dos vivas, y PostgREST no sabe cuál elegir.
drop function if exists top_ots_grupo(text, text);
drop function if exists top_ots_grupo(text, text, text);
drop function if exists top_ots_grupo(text, text, int, text);
drop function if exists top_ots_grupo(text, text, int, text, numeric);

create or replace function top_ots_grupo(p_marca text, p_modelo text)
returns table(
  work_item_name  text,
  autos_afectados bigint,
  total_ots       bigint,
  autos_grupo     bigint,
  pct_autos       numeric
)
language sql stable as $$
  with universo as (
    select count(distinct s.stock_id)::bigint as n
    from stock s
    where upper(s.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
  ),
  conteo as (
    select o.work_item_name as item,
           count(distinct o.stock_id)::bigint as autos,
           count(*)::bigint as ots
    from ots o
    where coalesce(trim(o.work_item_name), '') <> ''
      -- 'DEVOLUCION' es un work_item_name de `ots`, pero NO es una
      -- falla: tiene su propio histórico (devoluciones_grupo). Contarlo
      -- acá sería doble conteo.
      and upper(trim(o.work_item_name)) <> 'DEVOLUCION'
      and upper(o.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
    group by o.work_item_name
  )
  select
    c.item,
    c.autos,
    c.ots,
    u.n,
    round(100.0 * c.autos / nullif(u.n, 0), 1)
  from conteo c cross join universo u
  order by c.autos desc, c.ots desc
  limit 10;
$$;


-- ------------------------------------------------------------
-- 1b) Totales del grupo Marca+Modelo, como contexto del top 10.
--
--     Mismo match por MARCA+MODELO que top_ots_grupo. Sin límite,
--     así se sabe cuántas fallas distintas hay en total y el tamaño
--     del universo.
--
--     ots_por_auto se calcula sobre el universo completo (`stock`),
--     no sobre los autos con OTs — antes daba siempre >= 1 por
--     construcción. Se devuelve autos_con_ots aparte.
--
--     Ojo: work_item_name es el ítem de reparación puntual (FILTRO
--     DE ACEITE, NEUMATICO, PARABRISAS...), NO workshop_name (las
--     áreas de taller).
-- ------------------------------------------------------------
drop function if exists contar_tipos_ots_grupo(text, text, int, text);
drop function if exists resumen_ots_grupo(text, text);
drop function if exists resumen_ots_grupo(text, text, int, text);
drop function if exists resumen_ots_grupo(text, text, int, text, numeric);

create or replace function resumen_ots_grupo(p_marca text, p_modelo text)
returns table(
  tipos_distintos bigint,
  total_ots       bigint,
  autos_con_ots   bigint,
  autos_grupo     bigint,
  ots_por_auto    numeric
)
language sql stable as $$
  with universo as (
    select count(distinct s.stock_id)::bigint as n
    from stock s
    where upper(s.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
  ),
  filtradas as (
    select o.work_item_name as item, o.stock_id
    from ots o
    where coalesce(trim(o.work_item_name), '') <> ''
      -- Se excluye 'DEVOLUCION' — no es una falla, va por su propio
      -- canal (devoluciones_grupo). Mismo criterio que top_ots_grupo.
      and upper(trim(o.work_item_name)) <> 'DEVOLUCION'
      and upper(o.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
  ),
  conteo as (
    select item, count(distinct stock_id) as autos
    from filtradas group by item
  )
  select
    (select count(*) from conteo)::bigint,
    (select count(*) from filtradas)::bigint,
    (select count(distinct stock_id) from filtradas)::bigint,
    (select n from universo),
    round(
      (select count(*) from filtradas)::numeric
      / nullif((select n from universo), 0)
    , 2);
$$;


-- ------------------------------------------------------------
-- 2) Tasa de cangrejo del grupo Marca+Modelo
--
--    KPI directo, sin encogimiento estadístico (eso lo tenía la
--    versión anterior, indice_cangrejo, ya reemplazada):
--
--      tasa_mm = # autos del grupo que figuran en `cangrejos`
--              / # autos TOTALES del grupo (tabla `stock`)
--
--    Denominador: `stock` (fuente "CL - KAOS BBDD - ERP.csv"), el
--    inventario completo — una fila por auto, haya o no generado
--    una OT. Antes se usaba count(distinct stock_id) de `ots`, que
--    solo cuenta autos que pasaron por taller: subestima el
--    universo real y sesga la tasa hacia autos con más
--    intervenciones. `cangrejos` es subconjunto de `stock`
--    (mismo stock_id, motivo='CANGREJO'), así que el numerador
--    siempre está incluido en el denominador.
--
--    Se compara contra la tasa base global (mismo cálculo, sin
--    filtrar por marca/modelo) para saber cuántas veces por
--    encima del promedio está ese grupo. El puntaje de riesgo
--    (lib/cangrejo.ts) usa ese múltiplo, no el % crudo, porque
--    con una tasa base real de ~1% un % absoluto es ilegible
--    ("1,8%" no dice si es mucho o poco).
--
--    Por qué LIKE y no split_part por posición: mismo motivo que
--    en top_ots_grupo — modelos con guión propio (ej "F3-R")
--    rompen split_part(aux_sku,'-',2).
--
--    Aviso de tamaño de muestra: con poca exposición (autos_mm
--    chico) la tasa es ruidosa — 1 cangrejo sobre 1 auto da 100%.
--    Esta función NO aplica ningún piso mínimo de muestra; se
--    devuelve autos_mm para que quien lo use pueda decidir si
--    exigir un mínimo antes de confiar en la tasa.
-- ------------------------------------------------------------
create or replace function tasa_cangrejo_grupo(
  p_marca  text,
  p_modelo text
)
returns table(
  cangrejos_mm bigint,
  autos_mm     bigint,
  tasa_mm      numeric,   -- %
  tasa_base    numeric,   -- %
  veces_base   numeric
)
language sql stable as $$
  with base as (
    select
      (select count(*) from cangrejos)::numeric as c,
      (select count(distinct stock_id) from stock)::numeric as e
  ),
  grupo as (
    select
      (select count(*) from cangrejos g
        where upper(g.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
      )::bigint as cang,
      (select count(distinct s.stock_id) from stock s
        where upper(s.aux_sku) like upper(trim(p_marca) || '-' || trim(p_modelo) || '-%')
      )::bigint as autos
  )
  select
    g.cang,
    g.autos,
    round(100.0 * g.cang / nullif(g.autos, 0), 2),
    round(100.0 * b.c / nullif(b.e, 0), 2),
    round(
      (g.cang::numeric / nullif(g.autos, 0))
      / nullif(b.c / nullif(b.e, 0), 0)
    , 2)
  from grupo g, base b;
$$;

drop function if exists indice_cangrejo(text, text, int);


-- ------------------------------------------------------------
-- 2a) Tasa de cangrejo de la MARCA + score normalizado 0-1.
--
--     Para cada marca: tasa_mm = cangrejos / autos (todos sus
--     modelos). Esa tasa se normaliza dividiéndola por la tasa de la
--     marca PEOR (la más alta) entre las marcas con muestra
--     suficiente:
--
--       score = tasa_mm(marca) / max(tasa_mm)      ∈ [0, 1]
--
--     → la marca peor da score 1; las poco significativas, cerca de 0.
--
--     p_muestra_minima (default 5): piso de autos para que una marca
--     entre al cálculo del máximo. Sin esto, una marca con 1 auto y 1
--     cangrejo (tasa 100%) se volvería el techo y aplastaría a todas.
--     La marca consultada igual se devuelve aunque tenga menos autos;
--     su score se capa a 1.
--
--     Claves de marca: acento- y case-insensible. `stock.marca`
--     directo; en `cangrejos` (sin columna marca) se usa el prefijo
--     del aux_sku (MARCA-...).
-- ------------------------------------------------------------
drop function if exists tasa_cangrejo_marca(text);
drop function if exists tasa_cangrejo_marca(text, int);

create or replace function tasa_cangrejo_marca(
  p_marca          text,
  p_muestra_minima int default 5
)
returns table(
  cangrejos_mm bigint,
  autos_mm     bigint,
  tasa_mm      numeric,   -- %
  tasa_base    numeric,   -- %
  veces_base   numeric,
  score        numeric,   -- 0..1 = tasa_mm / peor tasa_mm entre marcas
  tasa_max_mm  numeric    -- % de la marca peor (denominador del score)
)
language sql stable as $$
  with
  base as (
    select
      (select count(*) from cangrejos)::numeric as c,
      (select count(distinct stock_id) from stock)::numeric as e
  ),
  autos_marca as (
    select
      upper(translate(trim(s.marca), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu')) as k,
      count(distinct s.stock_id)::numeric as autos
    from stock s
    where coalesce(trim(s.marca), '') <> ''
    group by 1
  ),
  cang_marca as (
    select
      split_part(
        upper(translate(trim(g.aux_sku), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu')), '-', 1
      ) as k,
      count(*)::numeric as cang
    from cangrejos g
    group by 1
  ),
  tasas as (
    select
      a.k,
      a.autos,
      coalesce(c.cang, 0) as cang,
      case when a.autos > 0 then coalesce(c.cang, 0) / a.autos else 0 end as tasa
    from autos_marca a
    left join cang_marca c on c.k = a.k
  ),
  maxt as (
    select max(tasa) as tasa_max
    from tasas
    where autos >= p_muestra_minima
  ),
  g as (
    select
      coalesce(max(autos), 0) as autos,
      coalesce(max(cang), 0)  as cang,
      coalesce(max(tasa), 0)  as tasa
    from tasas
    where k = upper(translate(trim(p_marca), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))
  )
  select
    g.cang::bigint,
    g.autos::bigint,
    round(100.0 * g.tasa, 2),
    round(100.0 * b.c / nullif(b.e, 0), 2),
    round(g.tasa / nullif(b.c / nullif(b.e, 0), 0), 2),
    round(least(g.tasa / nullif(m.tasa_max, 0), 1.0), 3),
    round(100.0 * m.tasa_max, 2)
  from g, base b, maxt m;
$$;


-- ------------------------------------------------------------
-- 2b) Peor caso real de vecesBase — el techo del índice de riesgo.
--
--     lib/cangrejo.ts escala riesgoTasa contra el vecesBase más
--     alto que exista en la base, para que 100 sea "el auto con
--     peor IQI y la tasa de cangrejo más alta jamás registrada por
--     marca+modelo", no un número inventado. Esto se recalcula acá
--     en vivo, no queda hardcodeado en el código — si el mes que
--     viene un modelo nuevo empeora, el techo se mueve solo, sin
--     tocar código ni redeployar.
--
--     Usa `stock` directo (motivo='CANGREJO'), no la tabla
--     `cangrejos` por separado — mismo dato, un solo group by.
--
--     p_muestra_minima: mismo piso que MUESTRA_MINIMA en
--     lib/cangrejo.ts (5 autos). Sin este piso, un grupo con 1
--     cangrejo sobre 1 auto (100% de tasa) se volvería el techo y
--     aplastaría la escala para todos los demás casos reales.
-- ------------------------------------------------------------
create or replace function max_veces_base_cangrejo(
  p_muestra_minima int default 5
)
returns numeric
language sql stable as $$
  with base as (
    select (select count(*) from cangrejos)::numeric
         / nullif((select count(distinct stock_id) from stock), 0) as tasa
  ),
  grupos as (
    select
      count(distinct stock_id) as autos,
      count(*) filter (where motivo = 'CANGREJO') as cangrejos
    from stock
    group by marca, modelo
    having count(distinct stock_id) >= p_muestra_minima
  )
  select round(
    max((g.cangrejos::numeric / g.autos) / nullif(b.tasa, 0))
  , 2)
  from grupos g cross join base b;
$$;


-- ------------------------------------------------------------
-- 3) Índices de apoyo (la exposición escanea ots/cangrejos enteras)
-- ------------------------------------------------------------
create index if not exists stock_marca_modelo_idx
  on stock (marca, modelo);
create index if not exists ots_marca_idx
  on ots (upper(trim(split_part(aux_sku, '-', 1))));
create index if not exists cangrejos_marca_idx
  on cangrejos (upper(trim(split_part(aux_sku, '-', 1))));
-- text_pattern_ops permite que Postgres use este índice para LIKE 'prefijo%',
-- que es como top_ots_grupo ahora busca (MARCA-MODELO-%-AÑO).
create index if not exists ots_aux_sku_prefix_idx
  on ots (upper(aux_sku) text_pattern_ops);
create index if not exists cangrejos_aux_sku_prefix_idx
  on cangrejos (upper(aux_sku) text_pattern_ops);
create index if not exists stock_aux_sku_prefix_idx
  on stock (upper(aux_sku) text_pattern_ops);
create index if not exists iqi_marca_norm_idx
  on iqi_marca (upper(translate(trim(marca), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu')));
create index if not exists iqi_marca_modelo_norm_idx
  on iqi_marca_modelo (upper(translate(trim(marca_modelo), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu')));
create index if not exists devoluciones_ot_aux_sku_prefix_idx
  on devoluciones_ot (upper(aux_sku) text_pattern_ops);

-- Refresca el caché de PostgREST: sin esto, las funciones nuevas o con
-- firma cambiada (grado_iqi_marca, devoluciones_grupo, tasa_cangrejo_marca,
-- top_ots_grupo y resumen_ots_grupo ahora con 2 args) pueden no aparecer
-- de inmediato para la API — el clásico "Could not find the function".
notify pgrst, 'reload schema';

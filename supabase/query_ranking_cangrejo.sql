-- ============================================================
-- Ranking de autos por índice de riesgo de cangrejo (0-100).
-- Sigue la lógica de lib/cangrejo.ts + lib/iqi.ts, calculada por
-- auto individual usando su km real desde `stock`.
--
-- Nota: el grado de MARCA se toma de la tabla `iqi_marca` (igual
-- que la app vía grado_iqi_marca()), NO de una tabla hardcodeada.
-- El factor de tasa usa el tope fijo 10 de la 1a versión de la
-- fórmula; la app ya escala contra max_veces_base_cangrejo(), así
-- que este ranking es una aproximación, no una réplica exacta.
-- ============================================================

with base as (
  select
    (select count(*) from cangrejos)::numeric
      / nullif((select count(distinct stock_id) from stock), 0) as tasa_base
),

-- Tasa de cangrejo por marca+modelo (igual que tasa_cangrejo_grupo,
-- pero para todos los grupos de una vez en vez de uno por uno).
tasa_mm as (
  select
    s.marca, s.modelo,
    count(*) filter (where s.motivo = 'CANGREJO') as cangrejos_mm,
    count(distinct s.stock_id) as autos_mm
  from stock s
  group by 1, 2
),

-- IQI por auto individual: año y km con los mismos buckets y pesos
-- que lib/iqi.ts. El grado de marca sale de `iqi_marca` (letra A-E,
-- convertida a índice 0-4). Sin fila para la marca → índice 2 ('C'),
-- mismo default que normalizaGradoMarca() en lib/iqi.ts.
-- Sin KM válido, el cálculo usa 2 factores (año+marca) en vez de 3.
iqi_por_auto as (
  select
    s.stock_id, s.marca, s.modelo, s.anio, s.km,

    case
      when s.anio >= 2023 then 0 when s.anio >= 2021 then 1
      when s.anio >= 2019 then 2 when s.anio >= 2016 then 3
      else 4
    end as idx_anio,

    case
      when s.km is null or s.km <= 0 then null
      when s.km <= 30000 then 0 when s.km <= 60000 then 1
      when s.km <= 90000 then 2 when s.km <= 120000 then 3
      else 4
    end as idx_km,

    coalesce(
      case upper(trim(im.grado))
        when 'A' then 0 when 'B' then 1 when 'C' then 2
        when 'D' then 3 when 'E' then 4 else 2
      end
    , 2) as idx_marca
  from stock s
  left join iqi_marca im
    on upper(translate(trim(im.marca), 'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))
     = upper(translate(trim(s.marca),  'ÁÉÍÓÚÜáéíóúü', 'AEIOUUaeiouu'))
),

iqi_puntaje as (
  select
    stock_id, marca, modelo, anio, km,
    case
      when idx_km is null then 100 - (idx_anio + idx_marca) * (100.0 / 2 / 4)
      else 100 - (idx_anio + idx_km + idx_marca) * (100.0 / 3 / 4)
    end as puntaje
  from iqi_por_auto
)

select
  c.marca, c.modelo, c.anio, c.km,
  round(coalesce(t.cangrejos_mm, 0)::numeric / nullif(t.autos_mm, 0) * 100, 2) as tasa_mm_pct,
  t.autos_mm,
  round(c.puntaje, 1) as iqi_puntaje,
  -- riesgoIqi = 100 - puntaje
  round(100 - c.puntaje, 1) as riesgo_iqi,
  -- vecesBase: si el grupo tiene < 5 autos, se asume 1x (igual que MUESTRA_MINIMA en TS)
  round(
    case when coalesce(t.autos_mm, 0) >= 5
      then (coalesce(t.cangrejos_mm, 0)::numeric / nullif(t.autos_mm, 0)) / nullif(b.tasa_base, 0)
      else 1
    end
  , 2) as veces_base,
  -- riesgoTasa = min(vecesBase, 10) / 10 * 100
  round(
    least(
      case when coalesce(t.autos_mm, 0) >= 5
        then (coalesce(t.cangrejos_mm, 0)::numeric / nullif(t.autos_mm, 0)) / nullif(b.tasa_base, 0)
        else 1
      end
    , 10) / 10 * 100
  , 1) as riesgo_tasa,
  -- índice final = 0,3 × riesgoIqi + 0,7 × riesgoTasa
  round(
    0.3 * (100 - c.puntaje)
    + 0.7 * (
        least(
          case when coalesce(t.autos_mm, 0) >= 5
            then (coalesce(t.cangrejos_mm, 0)::numeric / nullif(t.autos_mm, 0)) / nullif(b.tasa_base, 0)
            else 1
          end
        , 10) / 10 * 100
      )
  , 1) as indice
from iqi_puntaje c
left join tasa_mm t on t.marca = c.marca and t.modelo = c.modelo
cross join base b
order by indice desc
limit 50;

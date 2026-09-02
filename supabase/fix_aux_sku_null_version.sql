-- ============================================================
-- Fix: aux_sku de `stock` quedaba NULL cuando version era NULL,
-- por '||' con NULL anulando toda la concatenación. Eso sacaba a
-- esos autos de CUALQUIER búsqueda por LIKE (tasa_cangrejo_grupo,
-- top_ots_grupo, resumen_ots_grupo) sin ningún error visible.
--
-- Ejemplo real: BMW Serie 1 daba 45 autos en vez de 65 — los 21
-- registros sin versión cargada desaparecían del conteo.
--
-- Una columna GENERATED no admite ALTER de su expresión: hay que
-- sacarla y crearla de nuevo. Eso borra los índices que dependían
-- de ella, por eso después hay que volver a correr
-- funciones_riesgo.sql completo (ya tiene los índices con
-- "create index if not exists").
-- ============================================================

alter table stock drop column aux_sku;

alter table stock add column aux_sku text generated always as (
  marca || '-' || modelo || '-' || coalesce(version, '') || '-' || anio::text
) stored;

notify pgrst, 'reload schema';

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { calcularIqi } from "@/lib/iqi";

export const dynamic = "force-dynamic";

function normaliza(s: string) {
  return (s || "").toUpperCase().trim();
}

type OtRow = {
  work_item_name: string;
  autos_afectados: number;
  total_ots: number;
  autos_grupo: number;
  pct_autos: number | null;
};


export async function POST(req: NextRequest) {
  const body = await req.json();
  const { marca, modelo, version, anio, km, email } = body as {
    marca: string; modelo: string; version?: string; anio: number;
    km?: number; email?: string;
  };

  if (!marca || !modelo || !anio) {
    return NextResponse.json({ error: "Faltan marca/modelo/año" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const tieneVersion = !!version;
  const fullAuxSku = tieneVersion ? normaliza(`${marca}-${modelo}-${version}-${anio}`) : null;

  const [
    { data: insp, error: errInsp },
    { data: topOtsRpc, error: errOts },
    { data: resumenOtsRpc, error: errResumenOts },
    { data: tasaCangrejoRpc, error: errCangrejos },
    { data: tasaCangrejoMarcaRpc, error: errCangrejosMarca },
    { data: gradoMarcaRpc },
    { data: devsRpc },
    { data: alertas },
  ] = await Promise.all([
    // Una sola función cubre con y sin versión (ver funciones_riesgo.sql
    // sección 0). Antes había dos caminos: exact-match .eq('aux_sku',...)
    // con versión (frágil, el mismo problema de formato que ya rompió
    // top_ots_grupo) y una RPC sin versión que no existía en este repo,
    // y cuyo error nunca se chequeaba — el banner de Inspección
    // Diferenciada podía fallar en silencio sin dejar rastro.
    supabase.rpc("insp_dif_grupo", {
      p_marca: marca,
      p_modelo: modelo,
      p_anio: anio,
      p_version: version ?? null,
    }).maybeSingle(),
    // Fallas y resumen de OTs por marca+modelo (todos los años/versiones),
    // igual que tasa_cangrejo_grupo y devoluciones_grupo — histórico completo.
    supabase.rpc("top_ots_grupo", { p_marca: marca, p_modelo: modelo }),
    supabase.rpc("resumen_ots_grupo", { p_marca: marca, p_modelo: modelo }),
    supabase.rpc("tasa_cangrejo_grupo", { p_marca: marca, p_modelo: modelo }),
    // Tasa de cangrejo de la MARCA entera (todos sus modelos). KPI
    // que reemplazó al índice de riesgo compuesto — más agregada que
    // la de marca+modelo, sirve cuando el modelo tiene poca muestra.
    supabase.rpc("tasa_cangrejo_marca", { p_marca: marca }),
    // Grado A-E de la marca — lookup en la tabla `iqi_marca` (se
    // sincroniza desde la hoja "IQI" del ERP). El código NO lo
    // calcula. Sin error-check propio: si la RPC falla o la marca no
    // está, calcularIqi() cae a 'C' (factor neutro) en vez de romper
    // el checklist. `marcaConGrado` en la respuesta marca ese caso.
    supabase.rpc("grado_iqi_marca", { p_marca: marca }),
    // Histórico de devoluciones SIEMPRE por marca+modelo (no depende
    // de versión/año). Tabla `devoluciones_ot` (hoja "OT devolución").
    supabase.rpc("devoluciones_grupo", { p_marca: marca, p_modelo: modelo }),
    supabase.from("alertas_motor").select("*"),
  ]);

  if (errInsp) return NextResponse.json({ error: errInsp.message }, { status: 500 });
  if (errOts) return NextResponse.json({ error: errOts.message }, { status: 500 });
  if (errResumenOts) return NextResponse.json({ error: errResumenOts.message }, { status: 500 });
  if (errCangrejos) return NextResponse.json({ error: errCangrejos.message }, { status: 500 });
  if (errCangrejosMarca) return NextResponse.json({ error: errCangrejosMarca.message }, { status: 500 });

  const dev = (Array.isArray(devsRpc) ? devsRpc[0] : devsRpc) as
    | {
        total_devoluciones: number;
        autos_devueltos: number;
        autos_grupo: number;
        pct_autos: number | null;
      }
    | undefined;
  // La devolución cuenta UNA vez por auto: un mismo auto devuelto 2
  // veces = 1. Por eso se usa autos_devueltos (distinct stock_id), no
  // total_devoluciones (eventos).
  const autosDevueltos = Number(dev?.autos_devueltos ?? 0);
  const autosGrupoDev = Number(dev?.autos_grupo ?? 0);
  const pctDevoluciones = dev?.pct_autos != null ? Number(dev.pct_autos) : null;

  const inspDif = insp as { kms_inspe_plus: number; link: string } | null;

  // Top 10 fallas del modelo, ordenadas por incidencia (% de autos afectados).
  const todasOts = ((topOtsRpc ?? []) as OtRow[]).map((r) => ({
    item: r.work_item_name,
    autos: Number(r.autos_afectados),
    count: Number(r.total_ots),
    autosGrupo: Number(r.autos_grupo),
    pct: r.pct_autos != null ? Number(r.pct_autos) : null,
  }));

  // Number(): las RPC de conteo devuelven bigint/numeric y PostgREST
  // puede serializarlos como string, lo que rompería las comparaciones.
  const tasaCangrejo = (Array.isArray(tasaCangrejoRpc) ? tasaCangrejoRpc[0] : tasaCangrejoRpc) as
    | {
        cangrejos_mm: number;
        autos_mm: number;
        tasa_mm: number | null;
        tasa_base: number;
        veces_base: number | null;
      }
    | undefined;
  const cangrejosDelGrupo = Number(tasaCangrejo?.cangrejos_mm ?? 0);
  const autosMarcaModelo = Number(tasaCangrejo?.autos_mm ?? 0);
  const tasaMarcaModelo = tasaCangrejo?.tasa_mm != null ? Number(tasaCangrejo.tasa_mm) : null;
  const tasaBase = Number(tasaCangrejo?.tasa_base ?? 0);
  const vecesBase = tasaCangrejo?.veces_base != null ? Number(tasaCangrejo.veces_base) : null;

  // Tasa de cangrejo de la marca entera (todos sus modelos).
  const tasaCangrejoMarca = (Array.isArray(tasaCangrejoMarcaRpc)
    ? tasaCangrejoMarcaRpc[0]
    : tasaCangrejoMarcaRpc) as
    | {
        cangrejos_mm: number;
        autos_mm: number;
        tasa_mm: number | null;
        tasa_base: number;
        veces_base: number | null;
        score: number | null;
        tasa_max_mm: number | null;
      }
    | undefined;
  const cangrejosMarca = Number(tasaCangrejoMarca?.cangrejos_mm ?? 0);
  const autosMarca = Number(tasaCangrejoMarca?.autos_mm ?? 0);
  const tasaMarca = tasaCangrejoMarca?.tasa_mm != null ? Number(tasaCangrejoMarca.tasa_mm) : null;
  const vecesBaseMarca =
    tasaCangrejoMarca?.veces_base != null ? Number(tasaCangrejoMarca.veces_base) : null;
  // Score 0-1: tasa de la marca / tasa de la marca peor. 1 = la peor.
  const scoreMarca = tasaCangrejoMarca?.score != null ? Number(tasaCangrejoMarca.score) : null;
  const tasaMaxMarca =
    tasaCangrejoMarca?.tasa_max_mm != null ? Number(tasaCangrejoMarca.tasa_max_mm) : null;

  const resumenOts = (Array.isArray(resumenOtsRpc) ? resumenOtsRpc[0] : resumenOtsRpc) as
    | {
        tipos_distintos: number;
        total_ots: number;
        autos_con_ots: number;
        autos_grupo: number;
        ots_por_auto: number;
      }
    | undefined;
  const totalTiposOts = Number(resumenOts?.tipos_distintos ?? todasOts.length);
  const otsPorAuto = Number(resumenOts?.ots_por_auto ?? 0);
  const autosConOts = Number(resumenOts?.autos_con_ots ?? 0);
  const autosDelGrupo = Number(resumenOts?.autos_grupo ?? 0);

  const iqi = calcularIqi(
    typeof gradoMarcaRpc === "string" ? gradoMarcaRpc : null,
    anio,
    km
  );

  const alertaMotor = version
    ? (alertas ?? []).find((a: any) => normaliza(version).includes(normaliza(a.motor)))
    : undefined;

  // El listado de items se eliminó: repetía uno por uno lo que ya
  // muestra el ranking de fallas ("El 21,1% de los X presenta Y" vs
  // "Y — 21,1%"), más unos items genéricos fijos que no salían de
  // ningún dato ("Problemas generales de motor - X").

  return NextResponse.json({
    auxSku: fullAuxSku ?? `${normaliza(marca)}-${normaliza(modelo)}-${anio}`,
    iqi,
    inspeccionDiferenciada: inspDif
      ? {
          umbralKm: inspDif.kms_inspe_plus,
          link: inspDif.link,
          superaUmbral: km != null ? km >= inspDif.kms_inspe_plus : null,
        }
      : null,
    stats: {
      // Devoluciones por marca+modelo (tabla devoluciones_ot), únicas
      // por auto: autos distintos con al menos una devolución.
      devoluciones: autosDevueltos,
      autosGrupoDev,
      pctDevoluciones,
      cangrejos: cangrejosDelGrupo,
      totalTiposOts,
      otsPorAuto,
      autosConOts,
      autosDelGrupo,
      otsTop10: todasOts,
    },
    cangrejo: {
      // Tasa real del grupo marca+modelo.
      tasa: {
        cangrejosMm: cangrejosDelGrupo,
        autosMm: autosMarcaModelo,
        tasaMm: tasaMarcaModelo,
        tasaBase,
        vecesBase,
      },
      // Tasa de la marca entera (todos sus modelos) + score 0-1
      // normalizado contra la marca peor. Reemplazó al índice IQI+tasa.
      tasaMarca: {
        cangrejosMm: cangrejosMarca,
        autosMm: autosMarca,
        tasaMm: tasaMarca,
        tasaBase,
        vecesBase: vecesBaseMarca,
        score: scoreMarca,
        tasaMax: tasaMaxMarca,
      },
    },
    alertaMotor: alertaMotor ? { motor: alertaMotor.motor, link: alertaMotor.link } : null,
    email: email ?? null,
  });
}

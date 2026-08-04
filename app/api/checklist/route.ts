import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { calcularCqi } from "@/lib/cqi";
import { calcularIndiceCangrejo } from "@/lib/cangrejo";

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
  const anioStr = String(anio);

  const [
    inspResult,
    { data: topOtsRpc, error: errOts },
    { data: resumenOtsRpc, error: errResumenOts },
    { data: tasaCangrejoRpc, error: errCangrejos },
    { data: maxVecesBaseRpc },
    devsResult,
    { data: alertas },
  ] = await Promise.all([
    tieneVersion
      ? supabase.from("insp_dif").select("kms_inspe_plus, link").eq("aux_sku", fullAuxSku).maybeSingle()
      : supabase.rpc("insp_dif_grupo", { p_marca: marca, p_modelo: modelo, p_anio: anioStr }).maybeSingle(),
    supabase.rpc("top_ots_grupo", {
      p_marca: marca,
      p_modelo: modelo,
      p_anio: anio,
      p_version: version ?? null,
    }),
    supabase.rpc("resumen_ots_grupo", {
      p_marca: marca,
      p_modelo: modelo,
      p_anio: anio,
      p_version: version ?? null,
    }),
    supabase.rpc("tasa_cangrejo_grupo", { p_marca: marca, p_modelo: modelo }),
    // Peor vecesBase real de TODA la base — no depende de marca/modelo
    // buscado, es el techo del índice de riesgo (lib/cangrejo.ts). Sin
    // error-check propio: si falla, calcularIndiceCangrejo cae a su
    // resguardo interno (DEFAULT_MAX_VECES_BASE) en vez de romper el
    // checklist por un dato que es solo de calibración.
    supabase.rpc("max_veces_base_cangrejo"),
    tieneVersion
      ? supabase.from("devoluciones").select("descripcion").eq("aux_sku", fullAuxSku)
      : supabase.rpc("devoluciones_grupo", { p_marca: marca, p_modelo: modelo, p_anio: anioStr }),
    supabase.from("alertas_motor").select("*"),
  ]);

  if (errOts) return NextResponse.json({ error: errOts.message }, { status: 500 });
  if (errResumenOts) return NextResponse.json({ error: errResumenOts.message }, { status: 500 });
  if (errCangrejos) return NextResponse.json({ error: errCangrejos.message }, { status: 500 });

  const insp = inspResult.data as { kms_inspe_plus: number; link: string } | null;
  const devs = (devsResult.data ?? []) as { descripcion: string }[];

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

  const cqi = calcularCqi(marca, anio, km);
  const riesgo = calcularIndiceCangrejo({
    cqiPuntaje: cqi.puntaje,
    vecesBase,
    autosMarcaModelo,
    maxVecesBase: maxVecesBaseRpc != null ? Number(maxVecesBaseRpc) : null,
  });

  const alertaMotor = version
    ? (alertas ?? []).find((a: any) => normaliza(version).includes(normaliza(a.motor)))
    : undefined;

  // El listado de items se eliminó: repetía uno por uno lo que ya
  // muestra el ranking de fallas ("El 21,1% de los X presenta Y" vs
  // "Y — 21,1%"), más unos items genéricos fijos que no salían de
  // ningún dato ("Problemas generales de motor - X").

  return NextResponse.json({
    auxSku: fullAuxSku ?? `${normaliza(marca)}-${normaliza(modelo)}-${anio}`,
    cqi,
    inspeccionDiferenciada: insp
      ? { umbralKm: insp.kms_inspe_plus, link: insp.link, superaUmbral: km != null ? km >= insp.kms_inspe_plus : null }
      : null,
    stats: {
      devoluciones: devs.length,
      cangrejos: cangrejosDelGrupo,
      totalTiposOts,
      otsPorAuto,
      autosConOts,
      autosDelGrupo,
      otsTop10: todasOts,
    },
    devoluciones: devs.map((d) => d.descripcion),
    cangrejo: {
      // KPI independiente: tasa real del grupo marca+modelo.
      tasa: {
        cangrejosMm: cangrejosDelGrupo,
        autosMm: autosMarcaModelo,
        tasaMm: tasaMarcaModelo,
        tasaBase,
        vecesBase,
      },
      // Índice de riesgo 0-100: CQI (30%) + tasa (70%). NO es una
      // probabilidad — la probabilidad real es tasa.tasaMm.
      riesgo: {
        indice: riesgo.indice,
        nivel: riesgo.nivel,
        muestraSuficiente: riesgo.muestraSuficiente,
        componentes: riesgo.componentes,
      },
    },
    alertaMotor: alertaMotor ? { motor: alertaMotor.motor, link: alertaMotor.link } : null,
    email: email ?? null,
  });
}

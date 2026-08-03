import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { calcularCqi } from "@/lib/cqi";
import { calcularProbabilidadCangrejo } from "@/lib/cangrejo";

export const dynamic = "force-dynamic";

function normaliza(s: string) {
  return (s || "").toUpperCase().trim();
}

type Tag = "motor" | "transmision" | "electronicos" | "suspension" | "carroceria";

function categorizar(workItemName: string): Tag {
  const n = normaliza(workItemName);
  if (n.includes("CAMBIO") || n.includes("TRANSMISION") || n.includes("CAJA") || n.includes("CREMALLERA")) return "transmision";
  if (n.includes("ELECTR") || n.includes("OBD") || n.includes("SENSOR") || n.includes("CHECK ENGINE") || n.includes("TESTIGO")) return "electronicos";
  if (n.includes("SUSPENSION") || n.includes("AMORTIGUADOR")) return "suspension";
  if (n.includes("CARROCERIA") || n.includes("PINTURA") || n.includes("CHOQUE") || n.includes("PARAGOLPE")) return "carroceria";
  return "motor";
}

type Item = { titulo: string; tag: Tag };

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
  const probabilidad = calcularProbabilidadCangrejo({
    cqiPuntaje: cqi.puntaje,
    vecesBase,
    autosMarcaModelo,
  });

  const alertaMotor = version
    ? (alertas ?? []).find((a: any) => normaliza(version).includes(normaliza(a.motor)))
    : undefined;

  // ── Armado del checklist ──
  const items: Item[] = [];

  if (cangrejosDelGrupo > 0) {
    items.push({
      titulo: "CANGREJO - Vehículo NO se pudo vender en Kavak - Diagnóstico motor general",
      tag: "motor",
    });
  }

  // Riesgo de cangrejo alto sin que el modelo tenga uno registrado:
  // igual hay que advertirlo, es el aporte del indicador.
  if (cangrejosDelGrupo === 0 && probabilidad.nivel !== "POCO PROBABLE") {
    items.push({
      titulo: `RIESGO DE CANGREJO ${probabilidad.nivel} (${probabilidad.porcentaje}%) - Diagnóstico motor general preventivo`,
      tag: "motor",
    });
  }

  const modeloAnio = `${marca} ${modelo} ${anio}`;

  // Fallas del modelo, redactadas por incidencia y ya ordenadas de
  // mayor a menor por top_ots_grupo — el orden es la prioridad.
  for (const ot of todasOts) {
    const tag = categorizar(ot.item);
    const sufijo = tag === "electronicos" ? " - OBD2/sensores" : tag === "motor" ? " - Diagnóstico motor general" : "";
    const titulo = ot.pct != null
      ? `El ${ot.pct}% de los ${modeloAnio} presenta ${ot.item}${sufijo}`
      : `${ot.item} en ${ot.autos} ${modeloAnio}${sufijo}`;
    items.push({ titulo, tag });
  }

  items.push({ titulo: `Fallas en sistema de transmisión - ${modeloAnio}`, tag: "transmision" });
  items.push({ titulo: `Problemas generales de motor - ${modeloAnio}`, tag: "motor" });
  items.push({ titulo: `Problemas de carrocería - ${modeloAnio} - Diagnóstico motor general`, tag: "motor" });
  items.push({ titulo: `Fallas en sistemas eléctricos - ${modeloAnio} - OBD2/sensores`, tag: "electronicos" });
  items.push({ titulo: `Problemas de suspensión - ${modeloAnio}`, tag: "suspension" });

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
    items,
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
      // Indicador combinado: CQI (30%) + tasa (70%).
      probabilidad: {
        porcentaje: probabilidad.porcentaje,
        nivel: probabilidad.nivel,
        muestraSuficiente: probabilidad.muestraSuficiente,
        componentes: probabilidad.componentes,
      },
    },
    alertaMotor: alertaMotor ? { motor: alertaMotor.motor, link: alertaMotor.link } : null,
    email: email ?? null,
  });
}

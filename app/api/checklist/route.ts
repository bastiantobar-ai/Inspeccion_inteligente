import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { calcularCqi } from "@/lib/cqi";
import { calcularRiesgoCangrejo } from "@/lib/cangrejo";

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

type Item = { titulo: string; tag: Tag; criticidad: number };

type OtRow = { work_item_name: string; cantidad: number; sobre_umbral: boolean };

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
    { data: cangrejosCount, error: errCangrejos },
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
    supabase.rpc("contar_cangrejos_grupo", { p_marca: marca, p_modelo: modelo }),
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

  const todasOts = ((topOtsRpc ?? []) as OtRow[]).map((r) => ({
    item: r.work_item_name,
    count: Number(r.cantidad),
    sobreUmbral: r.sobre_umbral,
  }));
  // Regla de negocio: "TOP 10 OTS mayor 3 OTS".
  const otsFrecuentes = todasOts.filter((o) => o.sobreUmbral);

  // Number(): las RPC de conteo devuelven bigint y PostgREST puede
  // serializarlo como string, lo que rompería las comparaciones.
  const cangrejosDelGrupo = Number(cangrejosCount ?? 0);

  const resumenOts = (Array.isArray(resumenOtsRpc) ? resumenOtsRpc[0] : resumenOtsRpc) as
    | { tipos_distintos: number; recurrentes: number }
    | undefined;
  const totalTiposOts = Number(resumenOts?.tipos_distintos ?? todasOts.length);
  // Sin limit 10, a diferencia de otsFrecuentes (que sale del top 10).
  const otsRecurrentes = Number(resumenOts?.recurrentes ?? otsFrecuentes.length);

  const cqi = calcularCqi(marca, anio, km);
  const riesgo = calcularRiesgoCangrejo({
    cqi: cqi.grado,
    anio,
    tiposOtsDistintos: totalTiposOts,
    cangrejosMarcaModelo: cangrejosDelGrupo,
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
      criticidad: 5,
    });
  }

  // Riesgo de cangrejo alto sin que el modelo tenga uno registrado:
  // igual hay que advertirlo, es el aporte del puntaje.
  if (cangrejosDelGrupo === 0 && riesgo.nivel !== "POCO PROBABLE") {
    items.push({
      titulo: `RIESGO DE CANGREJO ${riesgo.nivel} (${riesgo.puntaje}/10) - Diagnóstico motor general preventivo`,
      tag: "motor",
      criticidad: riesgo.nivel === "MUY PROBABLE" ? 5 : 4,
    });
  }

  if (anio < 2016) {
    items.push({
      titulo: `Vehículo año ${anio} (previo a 2016) - Mayor probabilidad de cangrejo - Revisión mecánica reforzada`,
      tag: "motor",
      criticidad: 4,
    });
  }

  if (otsFrecuentes[0] && categorizar(otsFrecuentes[0].item) === "motor") {
    items.push({ titulo: "DIAGNÓSTICO DEL MOTOR - Problema frecuente en este modelo", tag: "motor", criticidad: 5 });
  }

  for (const ot of otsFrecuentes) {
    const tag = categorizar(ot.item);
    const sufijo = tag === "electronicos" ? " - OBD2/sensores" : tag === "motor" ? " - Diagnóstico motor general" : "";
    items.push({
      titulo: `${ot.item} (${ot.count} OTs) - Problema frecuente en este modelo${sufijo}`,
      tag,
      criticidad: 4,
    });
  }

  // Si ningún ítem superó las 3 OTs, se muestran los observados con
  // criticidad menor en vez de dejar la sección vacía.
  if (otsFrecuentes.length === 0) {
    for (const ot of todasOts.slice(0, 10)) {
      const tag = categorizar(ot.item);
      items.push({
        titulo: `${ot.item} (${ot.count} OT${ot.count > 1 ? "s" : ""}) - Antecedente puntual del modelo`,
        tag,
        criticidad: 2,
      });
    }
  }

  const modeloAnio = `${marca} ${modelo} ${anio}`;
  items.push({ titulo: `Fallas en sistema de transmisión - ${modeloAnio}`, tag: "transmision", criticidad: 4 });
  items.push({ titulo: `Problemas generales de motor - ${modeloAnio}`, tag: "motor", criticidad: 3 });
  items.push({ titulo: `Problemas de carrocería - ${modeloAnio} - Diagnóstico motor general`, tag: "motor", criticidad: 3 });
  items.push({ titulo: `Fallas en sistemas eléctricos - ${modeloAnio} - OBD2/sensores`, tag: "electronicos", criticidad: 3 });
  items.push({ titulo: `Problemas de suspensión - ${modeloAnio}`, tag: "suspension", criticidad: 3 });

  return NextResponse.json({
    auxSku: fullAuxSku ?? `${normaliza(marca)}-${normaliza(modelo)}-${anio}`,
    cqi,
    inspeccionDiferenciada: insp
      ? { umbralKm: insp.kms_inspe_plus, link: insp.link, superaUmbral: km != null ? km >= insp.kms_inspe_plus : null }
      : null,
    stats: {
      devoluciones: devs.length,
      cangrejos: cangrejosDelGrupo,
      ots: otsRecurrentes,
      totalTiposOts,
      otsTop10: todasOts,
    },
    items,
    devoluciones: devs.map((d) => d.descripcion),
    cangrejo: {
      puntaje: riesgo.puntaje,
      maximo: riesgo.maximo,
      nivel: riesgo.nivel,
      criterios: riesgo.criterios,
      antiguedadRiesgo: anio < 2016,
    },
    alertaMotor: alertaMotor ? { motor: alertaMotor.motor, link: alertaMotor.link } : null,
    email: email ?? null,
  });
}

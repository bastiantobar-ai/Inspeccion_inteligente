import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { marca, modelo, version, anio, km, email } = body as {
    marca: string; modelo: string; version: string; anio: number;
    km?: number; email?: string;
  };

  if (!marca || !modelo || !version || !anio) {
    return NextResponse.json({ error: "Faltan marca/modelo/version/año" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const fullAuxSku = normaliza(`${marca}-${modelo}-${version}-${anio}`);
  const anioStr = String(anio);

  const [{ data: insp }, { data: topOtsRpc, error: errOts }, { data: cangrejosCount, error: errCangrejos }, { data: devs }, { data: alertas }] =
    await Promise.all([
      supabase.from("insp_dif").select("*").eq("aux_sku", fullAuxSku).maybeSingle(),
      supabase.rpc("top_ots_grupo", { p_marca: marca, p_modelo: modelo, p_anio: anioStr }),
      supabase.rpc("contar_cangrejos_grupo", { p_marca: marca, p_modelo: modelo, p_anio: anioStr }),
      supabase.from("devoluciones").select("descripcion, aux_sku").eq("aux_sku", fullAuxSku),
      supabase.from("alertas_motor").select("*"),
    ]);

  if (errOts) return NextResponse.json({ error: errOts.message }, { status: 500 });
  if (errCangrejos) return NextResponse.json({ error: errCangrejos.message }, { status: 500 });

  const topOts = (topOtsRpc ?? []).map((r: any) => ({ item: r.work_item_name, count: r.cantidad }));
  const cangrejosDelGrupo = cangrejosCount ?? 0;
  const boostAntiguedad = anio < 2016;

  let cqi: "A" | "B" | "C" | "D" | "E" = "E";
  if (km != null && insp?.kms_inspe_plus) {
    const ratio = km / insp.kms_inspe_plus;
    if (ratio < 0.5) cqi = "A";
    else if (ratio < 0.8) cqi = "B";
    else if (ratio < 1.0) cqi = "C";
    else if (ratio < 1.2) cqi = "D";
    else cqi = "E";
  }

  const alertaMotor = (alertas ?? []).find((a: any) =>
    normaliza(version).includes(normaliza(a.motor))
  );

  const items: Item[] = [];

  if (cangrejosDelGrupo > 0) {
    items.push({
      titulo: "CANGREJO - Vehículo NO se pudo vender en Kavak - Diagnóstico motor general",
      tag: "motor",
      criticidad: 5,
    });
  }
  if (topOts[0] && categorizar(topOts[0].item) === "motor") {
    items.push({ titulo: "DIAGNÓSTICO DEL MOTOR - Problema frecuente en este modelo", tag: "motor", criticidad: 5 });
  }
  for (const ot of topOts) {
    const tag = categorizar(ot.item);
    const sufijo = tag === "electronicos" ? " - OBD2/sensores" : tag === "motor" ? " - Diagnóstico motor general" : "";
    items.push({ titulo: `${ot.item} - Problema frecuente en este modelo${sufijo}`, tag, criticidad: 4 });
  }

  const modeloAnio = `${marca} ${modelo} ${anio}`;
  items.push({ titulo: `Fallas en sistema de transmisión - ${modeloAnio}`, tag: "transmision", criticidad: 4 });
  items.push({ titulo: `Problemas generales de motor - ${modeloAnio}`, tag: "motor", criticidad: 3 });
  items.push({ titulo: `Problemas de carrocería - ${modeloAnio} - Diagnóstico motor general`, tag: "motor", criticidad: 3 });
  items.push({ titulo: `Fallas en sistemas eléctricos - ${modeloAnio} - OBD2/sensores`, tag: "electronicos", criticidad: 3 });
  items.push({ titulo: `Problemas de suspensión - ${modeloAnio}`, tag: "suspension", criticidad: 3 });

  return NextResponse.json({
    auxSku: fullAuxSku,
    cqi,
    inspeccionDiferenciada: insp
      ? { umbralKm: insp.kms_inspe_plus, link: insp.link, superaUmbral: km != null ? km >= insp.kms_inspe_plus : null }
      : null,
    stats: {
      devoluciones: (devs ?? []).length,
      cangrejos: cangrejosDelGrupo,
      ots: topOts.length,
      otsListado: topOts.map((o) => o.item),
    },
    items,
    devoluciones: (devs ?? []).map((d: any) => d.descripcion),
    cangrejo: { cantidadEnGrupo: cangrejosDelGrupo, antiguedadRiesgo: boostAntiguedad },
    alertaMotor: alertaMotor ? { motor: alertaMotor.motor, link: alertaMotor.link } : null,
    email: email ?? null,
  });
}

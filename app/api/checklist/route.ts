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
  const groupKey = normaliza(`${marca}-${modelo}-${anio}`); // Marca-Modelo-Año, sin versión

  const [{ data: insp }, { data: ots }, { data: cangrejosGrupo }, { data: devs }, { data: alertas }] =
    await Promise.all([
      supabase.from("insp_dif").select("*").eq("aux_sku", fullAuxSku).maybeSingle(),
      supabase.from("ots").select("work_item_name, aux_sku"),
      supabase.from("cangrejos").select("aux_sku"),
      supabase.from("devoluciones").select("descripcion, aux_sku").eq("aux_sku", fullAuxSku),
      supabase.from("alertas_motor").select("*"),
    ]);

  // TOP work items con más de 3 OTs, agrupado por Marca-Modelo-Año
  // (aux_sku de OTs incluye versión, así que agrupamos ignorándola)
  const conteoOts = new Map<string, number>();
  for (const o of ots ?? []) {
    const auxParts = normaliza(o.aux_sku).split("-");
    const anioOt = auxParts[auxParts.length - 1];
    const marcaOt = auxParts[0];
    const modeloOt = auxParts[1];
    if (`${marcaOt}-${modeloOt}-${anioOt}` !== groupKey) continue;
    conteoOts.set(o.work_item_name, (conteoOts.get(o.work_item_name) ?? 0) + 1);
  }
  const topOts = Array.from(conteoOts.entries())
    .filter(([, c]) => c > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([item, count]) => ({ item, count }));

  // Probabilidad de cangrejo: cantidad del grupo Marca-Modelo-Año
  let cangrejosDelGrupo = 0;
  for (const c of cangrejosGrupo ?? []) {
    const auxParts = normaliza(c.aux_sku).split("-");
    const anioC = auxParts[auxParts.length - 1];
    const marcaC = auxParts[0];
    const modeloC = auxParts[1];
    if (`${marcaC}-${modeloC}-${anioC}` === groupKey) cangrejosDelGrupo++;
  }
  const boostAntiguedad = anio < 2016;

  // CQI (Marca-Año-Km) — clasificación A-E por kilometraje relativo al umbral de insp_dif
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

  // ── Armado del checklist ──
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

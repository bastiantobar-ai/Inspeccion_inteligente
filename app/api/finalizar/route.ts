import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Hora de Chile como "YYYY-MM-DD HH:mm:ss" (misma forma que creado_en).
function ahoraChile() {
  return new Date().toLocaleString("sv-SE", { timeZone: "America/Santiago" });
}

function sinT(s: string | null) {
  return s ? s.replace("T", " ").slice(0, 19) : s;
}

// Idempotente: finalizar una inspección ya finalizada NO es error (los
// cierres automáticos y reintentos pueden repetirse); se devuelve la hora
// original. Solo toca la fila del id recibido, nunca otras abiertas.
// Cierre manual: kriterioAyudo (sí/no) es obligatorio; comentario es opcional.
export async function POST(req: NextRequest) {
  const { consultaId, auto, kriterioAyudo, comentario } = (await req.json()) as {
    consultaId?: number;
    auto?: boolean;
    kriterioAyudo?: boolean;
    comentario?: string;
  };
  if (!consultaId) {
    return NextResponse.json({ error: "Falta consultaId" }, { status: 400 });
  }
  if (!auto && typeof kriterioAyudo !== "boolean") {
    return NextResponse.json({ error: "Falta indicar si Kriterio ayudó" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("consultas")
    .update({
      finalizada_en: ahoraChile(),
      finalizada_auto: !!auto,
      kriterio_ayudo: typeof kriterioAyudo === "boolean" ? kriterioAyudo : null,
      comentario: comentario?.trim().slice(0, 1000) || null,
    })
    .eq("id", consultaId)
    .is("finalizada_en", null)
    .select("finalizada_en")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data) return NextResponse.json({ finalizadaEn: sinT(data.finalizada_en) });

  const { data: existente, error: errLeer } = await supabase
    .from("consultas")
    .select("finalizada_en")
    .eq("id", consultaId)
    .maybeSingle();
  if (errLeer) return NextResponse.json({ error: errLeer.message }, { status: 500 });
  if (!existente) {
    return NextResponse.json({ error: "La inspección no existe" }, { status: 404 });
  }
  return NextResponse.json({ finalizadaEn: sinT(existente.finalizada_en), yaFinalizada: true });
}

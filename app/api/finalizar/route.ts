import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Idempotente: finalizar una inspección ya finalizada NO es error (los
// cierres automáticos y reintentos pueden repetirse); se devuelve la hora
// original. Solo toca la fila del id recibido, nunca otras abiertas.
export async function POST(req: NextRequest) {
  const { consultaId, auto } = (await req.json()) as { consultaId?: number; auto?: boolean };
  if (!consultaId) {
    return NextResponse.json({ error: "Falta consultaId" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("consultas")
    .update({ finalizada_en: new Date().toISOString(), finalizada_auto: !!auto })
    .eq("id", consultaId)
    .is("finalizada_en", null)
    .select("finalizada_en")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data) return NextResponse.json({ finalizadaEn: data.finalizada_en });

  const { data: existente, error: errLeer } = await supabase
    .from("consultas")
    .select("finalizada_en")
    .eq("id", consultaId)
    .maybeSingle();
  if (errLeer) return NextResponse.json({ error: errLeer.message }, { status: 500 });
  if (!existente) {
    return NextResponse.json({ error: "La inspección no existe" }, { status: 404 });
  }
  return NextResponse.json({ finalizadaEn: existente.finalizada_en, yaFinalizada: true });
}

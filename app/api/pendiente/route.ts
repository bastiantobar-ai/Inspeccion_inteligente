import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Inspección pendiente (abierta) de un correo: la fuente de verdad está en el
// servidor, así que sobrevive a pestañas descartadas, navegador cerrado o
// cambio de celular. Hay como máximo una por correo (índice único parcial).
export async function GET(req: NextRequest) {
  const email = (new URL(req.url).searchParams.get("email") ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ pendiente: null });

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("consultas")
    .select("id, marca, modelo, anio, km, patente, creado_en")
    .eq("email", email)
    .is("finalizada_en", null)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ pendiente: null });

  return NextResponse.json({
    pendiente: {
      id: data.id,
      marca: data.marca,
      modelo: data.modelo,
      anio: data.anio,
      km: data.km,
      patente: data.patente,
      creadoEn: String(data.creado_en).replace("T", " ").slice(0, 19),
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const marca = searchParams.get("marca");
  const modelo = searchParams.get("modelo");
  const version = searchParams.get("version");

  let field: "marca" | "modelo" | "version" | "anio";
  if (!marca) field = "marca";
  else if (!modelo) field = "modelo";
  else if (!version) field = "version";
  else field = "anio";

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.rpc("opciones_catalogo", {
    p_marca: marca,
    p_modelo: modelo,
    p_version: version,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const valores = (data ?? []).map((r: any) => r.valor);
  return NextResponse.json({ field, valores });
}

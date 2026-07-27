import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

// Devuelve valores distintos para poblar los combos en cascada:
// marca -> modelo -> version -> anio
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const marca = searchParams.get("marca");
  const modelo = searchParams.get("modelo");
  const version = searchParams.get("version");

  const supabase = getSupabaseServer();
  let query = supabase.from("catalogo").select("marca, modelo, version, anio");

  if (marca) query = query.eq("marca", marca);
  if (modelo) query = query.eq("modelo", modelo);
  if (version) query = query.eq("version", version);

  const { data, error } = await query.limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let field: "marca" | "modelo" | "version" | "anio";
  if (!marca) field = "marca";
  else if (!modelo) field = "modelo";
  else if (!version) field = "version";
  else field = "anio";

  const valores = Array.from(new Set((data ?? []).map((r: any) => r[field]))).sort();
  return NextResponse.json({ field, valores });
}

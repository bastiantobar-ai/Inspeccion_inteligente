/**
 * IQI — Índice de calidad: Marca · Año · KM  →  [A, B, C, D, E]
 *
 * MISMA fórmula que la hoja de cálculo (pestaña de deep-dive del ERP):
 *
 *   1. Cada factor (año, km, marca) es una letra A-E. Se convierte a
 *      puntos igual que el SWITCH de la hoja:
 *        A = 100   B = 80   C = 60   D = 40   E = 20      (= 100 - idx×20)
 *
 *   2. puntaje = PROMEDIO de los factores presentes:
 *        - con km  → 3 factores (año + km + marca)
 *        - sin km  → 2 factores (año + marca)   [el km es opcional]
 *
 *   3. grado:  >= 90 → A   >= 70 → B   >= 50 → C   >= 30 → D   resto → E
 *      (equivale a redondear el promedio de las letras)
 *
 * El puntaje va de 100 (todo A) a 20 (todo E), NO a 0 — es el promedio
 * de valores que nunca bajan de 20.
 *
 * Año y km: mismos tramos de bucket que la query original.
 * Marca: el grado A-E NO se calcula acá — llega como parámetro
 * (`gradoMarca`) desde la tabla `iqi_marca` de Supabase, que se
 * sincroniza desde la hoja "IQI" del ERP. Ver route.ts (RPC
 * grado_iqi_marca) y supabase/funciones_riesgo.sql.
 */

export type Iqi = "A" | "B" | "C" | "D" | "E";

const GRADOS: Iqi[] = ["A", "B", "C", "D", "E"];

/** Puntos por letra, igual que el SWITCH de la hoja: A=100 … E=20. */
function puntosFactor(g: Iqi): number {
  return 100 - GRADOS.indexOf(g) * 20;
}

/** Bucket año — tramos oficiales de la query. */
function bucketAnio(anio: number): Iqi {
  // La query original lista 2023-2025 como 'A' y manda todo lo demás
  // a 'E'. Acá 2026+ también es 'A': un auto 0 km no puede ser E.
  if (anio >= 2023) return "A";
  if (anio >= 2021) return "B";
  if (anio >= 2019) return "C";
  if (anio >= 2016) return "D";
  return "E";
}

/** Bucket km — tramos oficiales de la query. */
function bucketKm(km: number): Iqi {
  if (km <= 30_000) return "A";
  if (km <= 60_000) return "B";
  if (km <= 90_000) return "C";
  if (km <= 120_000) return "D";
  return "E";
}

/**
 * Grado de marca — llega ya calculado desde `iqi_marca` (Supabase).
 * Acá solo se valida la letra. Si no es A-E (marca sin fila en la
 * tabla —ej. Alfa Romeo, Porsche— o RPC sin resultado) se usa 'C',
 * el factor neutro.
 */
const GRADO_MARCA_DEFAULT: Iqi = "C";

function normalizaGradoMarca(grado: string | null | undefined): {
  grado: Iqi;
  encontrado: boolean;
} {
  const g = (grado ?? "").toUpperCase().trim();
  if (g === "A" || g === "B" || g === "C" || g === "D" || g === "E") {
    return { grado: g as Iqi, encontrado: true };
  }
  return { grado: GRADO_MARCA_DEFAULT, encontrado: false };
}

export type ResultadoIqi = {
  grado: Iqi;
  /** Promedio de los factores, 20-100 (100 = todo A, 20 = todo E). */
  puntaje: number;
  buckets: { anio: Iqi; km: Iqi | null; marca: Iqi };
  /** 2 (sin km) o 3 (con km). */
  factoresUsados: number;
  /** true si se calculó sin km (2 factores). */
  parcial: boolean;
  /** false si la marca no tenía grado en `iqi_marca` y se usó el default 'C'. */
  marcaConGrado: boolean;
};

/**
 * @param gradoMarca  Letra A-E de `iqi_marca` (vía RPC grado_iqi_marca).
 *                    null/undefined/valor raro → se usa 'C'.
 * @param anio        Año del vehículo.
 * @param km          Kilometraje (opcional). Sin km se promedian 2 factores.
 */
export function calcularIqi(
  gradoMarca: string | null | undefined,
  anio: number,
  km?: number | null
): ResultadoIqi {
  const bA = bucketAnio(anio);
  const { grado: bM, encontrado: marcaConGrado } = normalizaGradoMarca(gradoMarca);
  const kms = km != null && km > 0 ? km : null;
  const bK = kms === null ? null : bucketKm(kms);

  // Promedio de los factores presentes (mismo criterio que la hoja):
  // sin km se promedian solo año + marca, sin castigar por el dato ausente.
  const usados: Iqi[] = bK === null ? [bA, bM] : [bA, bK, bM];
  const puntajeRaw =
    usados.reduce((acc, g) => acc + puntosFactor(g), 0) / usados.length;

  // La clasificación va sobre el valor exacto, no sobre el redondeado.
  const grado: Iqi =
    puntajeRaw >= 90 ? "A" :
    puntajeRaw >= 70 ? "B" :
    puntajeRaw >= 50 ? "C" :
    puntajeRaw >= 30 ? "D" : "E";

  return {
    grado,
    puntaje: Math.round(puntajeRaw * 10) / 10,
    buckets: { anio: bA, km: bK, marca: bM },
    factoresUsados: usados.length,
    parcial: bK === null,
    marcaConGrado,
  };
}

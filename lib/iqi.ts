/**
 * IQI — Índice de calidad: Marca · Año · KM  →  [A, B, C, D, E]
 *
 * Reemplaza al CQI. Año y KM son IDÉNTICOS al CQI anterior (mismos
 * tramos de bucket, misma redistribución de pesos). Lo único que
 * cambió es la MARCA:
 *
 *   - Antes: el grado A-E de la marca se calculaba acá con una tabla
 *     `MARCA_BUCKET` hardcodeada en el código.
 *   - Ahora: el grado ya viene calculado aguas arriba y se guarda en
 *     la tabla `iqi_marca` de Supabase (se sincroniza desde la hoja
 *     "IQI" del ERP y se actualiza sola). route.ts lo trae con la RPC
 *     `grado_iqi_marca(p_marca)` y lo pasa acá como `gradoMarca`.
 *     Este módulo NO recalcula nada de marca: solo valida la letra.
 *
 * Redistribución del peso (sin cambios respecto al CQI):
 *   3 factores (año + km + marca) × 33,33 pts de castigo máx = 100
 *                                   paso entre letras = 33,33/4 = 8,333
 *   2 factores (año + marca, sin km) × 50 pts de castigo máx = 100
 *                                     paso entre letras = 50/4 = 12,5
 *
 * Cortes oficiales (sin cambios): 81,25 / 62,5 / 43,75 / 25.
 */

export type Iqi = "A" | "B" | "C" | "D" | "E";

const GRADOS: Iqi[] = ["A", "B", "C", "D", "E"];
const paso = (nFactores: number) => 100 / nFactores / 4;

/** Bucket año — tramos oficiales de la query (idéntico al CQI). */
function bucketAnio(anio: number): Iqi {
  // La query original lista 2023-2025 como 'A' y manda todo lo demás
  // a 'E'. Acá 2026+ también es 'A': un auto 0 km no puede ser E.
  if (anio >= 2023) return "A";
  if (anio >= 2021) return "B";
  if (anio >= 2019) return "C";
  if (anio >= 2016) return "D";
  return "E";
}

/** Bucket km — tramos oficiales de la query (idéntico al CQI). */
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
 * el factor neutro: mismo default que aplicaba el CQI a las marcas
 * fuera de sus listas.
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
  puntaje: number;
  buckets: { anio: Iqi; km: Iqi | null; marca: Iqi };
  factoresUsados: number;
  parcial: boolean;
  /** false si la marca no tenía grado en `iqi_marca` y se usó el default 'C'. */
  marcaConGrado: boolean;
};

/**
 * @param gradoMarca  Letra A-E de `iqi_marca` (vía RPC grado_iqi_marca).
 *                    null/undefined/valor raro → se usa 'C'.
 * @param anio        Año del vehículo.
 * @param km          Kilometraje (opcional). Sin km se calcula con 2 factores.
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

  // Si falta el KM (es opcional en el formulario) se aplica el mismo
  // criterio de redistribución: el peso se reparte entre los factores
  // que sí están, en vez de castigar con 'E' por un dato ausente.
  const usados: Iqi[] = bK === null ? [bA, bM] : [bA, bK, bM];
  const p = paso(usados.length);

  const castigo = usados.reduce((acc, g) => acc + GRADOS.indexOf(g) * p, 0);
  const puntaje = 100 - castigo;

  const grado: Iqi =
    puntaje >= 81.25 ? "A" :
    puntaje >= 62.5  ? "B" :
    puntaje >= 43.75 ? "C" :
    puntaje >= 25    ? "D" : "E";

  return {
    grado,
    puntaje: Math.round(puntaje * 10) / 10,
    buckets: { anio: bA, km: bK, marca: bM },
    factoresUsados: usados.length,
    parcial: bK === null,
    marcaConGrado,
  };
}

/**
 * CQI — Marca · Año · KM  →  [A, B, C, D, E]
 *
 * Réplica de la lógica oficial de la query de Databricks
 * (`CQI FINAL` / `CQI Origen`), con una diferencia deliberada:
 * acá NO existe el cuarto factor de OTs (ni `bucket_ot` de OTs no
 * realizadas ni `bucket_ot_insp` de OTs de inspección), porque este
 * CQI se calcula ANTES de inspeccionar el auto — solo se conoce
 * marca, año y km.
 *
 * Redistribución del peso:
 *   Original: 4 factores × 25 pts de castigo máximo = 100
 *             paso entre letras = 25/4 = 6,25
 *   Acá:      3 factores × 33,33 pts de castigo máximo = 100
 *             paso entre letras = 33,33/4 = 8,333
 *
 * La escala sigue yendo de 100 (todo A) a 0 (todo E), así que los
 * cortes oficiales no cambian: 81,25 / 62,5 / 43,75 / 25.
 *
 * Verificación de consistencia con la query original:
 *   Ford + 2024 + 20.000 km  → 3 factores: 100 − 4×8,333 = 66,7 → B
 *                            → original con bucket_ot='A': 100 − 25 = 75 → B  ✓
 */

export type Cqi = "A" | "B" | "C" | "D" | "E";

const GRADOS: Cqi[] = ["A", "B", "C", "D", "E"];
const paso = (nFactores: number) => 100 / nFactores / 4;

/** Bucket año — tramos oficiales de la query. */
function bucketAnio(anio: number): Cqi {
  // La query original lista 2023-2025 como 'A' y manda todo lo demás
  // a 'E'. Acá 2026+ también es 'A': un auto 0 km no puede ser E.
  if (anio >= 2023) return "A";
  if (anio >= 2021) return "B";
  if (anio >= 2019) return "C";
  if (anio >= 2016) return "D";
  return "E";
}

/** Bucket km — tramos oficiales de la query. */
function bucketKm(km: number): Cqi {
  if (km <= 30_000) return "A";
  if (km <= 60_000) return "B";
  if (km <= 90_000) return "C";
  if (km <= 120_000) return "D";
  return "E";
}

/** Bucket marca — listas oficiales de la query. Default 'C'. */
const MARCA_BUCKET: Record<string, Cqi> = {
  TOYOTA: "A", MAZDA: "A",

  MITSUBISHI: "B", CHANGAN: "B", GEELY: "B", HAVAL: "B", SSANGYONG: "B",

  SUZUKI: "C", KIA: "C", HYUNDAI: "C", SUBARU: "C", HONDA: "C",
  NISSAN: "C", RAM: "C", FIAT: "C", JAC: "C", MG: "C",

  CHEVROLET: "D", JEEP: "D", CHERY: "D", "GREAT WALL": "D",
  VOLKSWAGEN: "D", CITROEN: "D",

  FORD: "E", PEUGEOT: "E", RENAULT: "E", OPEL: "E",
  BMW: "E", VOLVO: "E", AUDI: "E", DODGE: "E",
};

function bucketMarca(marca: string): Cqi {
  // Sin tildes ni dieresis: el catalogo trae "Citroen" y "Citroen" indistinto.
  const n = (marca || "")
    .normalize("NFD")
    .split("")
    .filter((c) => {
      const cp = c.charCodeAt(0);
      return cp < 0x0300 || cp > 0x036f;
    })
    .join("")
    .toUpperCase()
    .trim();
  return MARCA_BUCKET[n] ?? "C";
}

export type ResultadoCqi = {
  grado: Cqi;
  puntaje: number;
  buckets: { anio: Cqi; km: Cqi | null; marca: Cqi };
  factoresUsados: number;
  parcial: boolean;
};

export function calcularCqi(marca: string, anio: number, km?: number | null): ResultadoCqi {
  const bA = bucketAnio(anio);
  const bM = bucketMarca(marca);
  const kms = km != null && km > 0 ? km : null;
  const bK = kms === null ? null : bucketKm(kms);

  // Si falta el KM (es opcional en el formulario) se aplica el mismo
  // criterio de redistribución: el peso se reparte entre los factores
  // que sí están, en vez de castigar con 'E' por un dato ausente.
  const usados: Cqi[] = bK === null ? [bA, bM] : [bA, bK, bM];
  const p = paso(usados.length);

  const castigo = usados.reduce((acc, g) => acc + GRADOS.indexOf(g) * p, 0);
  const puntaje = 100 - castigo;

  const grado: Cqi =
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
  };
}

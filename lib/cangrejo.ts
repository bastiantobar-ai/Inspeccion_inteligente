/**
 * Riesgo de CANGREJO — puntaje aditivo de 0 a 10.
 *
 * Se descartó devolver una probabilidad absoluta (%): la tasa base
 * real ronda el 1%, así que hasta un caso de riesgo alto mostraba
 * "1,8%" y resultaba ilegible. El puntaje 0-10 es directo.
 *
 * Criterios (suman 10 en el peor caso):
 *   Tasa de cangrejo del modelo ≥2x la base . 4 pts
 *   Año anterior a 2016 ...................... 4 pts
 *   Más de 5 problemas recurrentes ........... 2 pts
 *
 * Reparto de pesos. Con 3 criterios binarios hay 8 combinaciones,
 * así que los pesos definen toda la tabla de resultados:
 *
 *   ninguno ....................  0  POCO PROBABLE
 *   solo recurrentes ...........  2  POCO PROBABLE
 *   solo año / solo tasa .......  4  POCO PROBABLE
 *   año + recurrentes ..........  6  PROBABLE
 *   tasa + recurrentes .........  6  PROBABLE
 *   año + tasa ..................  8  MUY PROBABLE
 *   los tres ................... 10  MUY PROBABLE
 *
 * Ningún criterio por sí solo llega a PROBABLE: hacen falta dos
 * señales, para no alarmar por un dato aislado.
 *
 * Sobre el criterio de tasa: la versión anterior comparaba el
 * CONTEO crudo de cangrejos del grupo (>2), lo que sesga a favor
 * de modelos populares — más exposición, más cangrejos en números
 * absolutos aunque la proporción sea normal. Ejemplo real: Chevrolet
 * tenía 6 cangrejos (se ve mal) pero eran 3,7% de sus autos, mejor
 * que el promedio (~1%). Opel tenía menos cangrejos en total pero
 * 27,6% de tasa. Por eso ahora se compara la TASA del grupo
 * (cangrejos_mm / autos_mm, ambos vía tasa_cangrejo_grupo en
 * Supabase) contra la tasa base global, y se exige un múltiplo
 * (veces_base >= 2) en vez de un conteo absoluto.
 *
 * Aviso de muestra chica: con pocos autos en el grupo (autos_mm
 * bajo) la tasa es ruidosa — 1 cangrejo sobre 1 auto da veces_base
 * altísimo sin ser señal real. Por eso el criterio exige también
 * un mínimo de exposición (MUESTRA_MINIMA); sin eso, no se marca
 * como cumplido aunque la tasa sea alta.
 *
 * Justificación de cada peso, medida contra la base real:
 *   · Tasa de cangrejo (4): la señal circular más fuerte, pero
 *     ahora corregida por exposición en vez de conteo crudo.
 *   · Año <2016 (4): 1,86x de lift (10,2% vs 5,5%). El mejor
 *     predictor no circular.
 *   · Recurrentes (2): el más débil, ~1,3x a nivel de grupo.
 *
 * "Problema recurrente" = work_item_name con más de 3 OTs en el
 * grupo. Es el mismo número que la tarjeta muestra como titular.
 *
 * Criterios descartados por redundancia:
 *   · CQI D/E — el CQI ya incluye el año (sin KM es la mitad del
 *     cálculo), así que se disparaba junto con "año <2016" en ~93%
 *     de los casos: eran puntos midiendo dos veces la antigüedad.
 *   · Ítems de trabajo distintos >10 — se cumplía en el 100% de los
 *     casos reales (el mínimo medido fue 64) y además crecía con el
 *     tamaño de la flota, o sea medía popularidad, no riesgo.
 *
 * Lectura:
 *   < 5   → poco probable
 *   5 a 7 → existe probabilidad
 *   >= 8  → muy probable
 */

// Umbral de "cuántas veces la base" para que la tasa cuente como señal.
const UMBRAL_VECES_BASE = 2;
// Exposición mínima del grupo (autos con OTs) para confiar en la tasa.
const MUESTRA_MINIMA = 5;

export type NivelCangrejo = "POCO PROBABLE" | "PROBABLE" | "MUY PROBABLE";

export type CriterioCangrejo = {
  descripcion: string;
  puntos: number;
  cumple: boolean;
};

export type ResultadoCangrejo = {
  puntaje: number;
  maximo: number;
  nivel: NivelCangrejo;
  criterios: CriterioCangrejo[];
};

export function calcularRiesgoCangrejo(params: {
  anio: number;
  problemasRecurrentes: number;
  /** cangrejos_mm / autos_mm del grupo, dividido por la tasa base global. null si no hay exposición (autos_mm = 0). */
  vecesBase: number | null;
  /** autos del grupo con OTs registradas — exposición para confiar en la tasa. */
  autosMarcaModelo: number;
}): ResultadoCangrejo {
  const { anio, problemasRecurrentes, vecesBase, autosMarcaModelo } = params;

  const muestraSuficiente = autosMarcaModelo >= MUESTRA_MINIMA;
  const tasaAlta = muestraSuficiente && vecesBase != null && vecesBase >= UMBRAL_VECES_BASE;

  const criterios: CriterioCangrejo[] = [
    {
      descripcion: muestraSuficiente
        ? `Tasa de cangrejo del modelo ${vecesBase != null ? `${vecesBase}x` : "—"} la base (más de ${UMBRAL_VECES_BASE}x, sobre ${autosMarcaModelo} autos)`
        : `Muestra insuficiente para medir tasa (${autosMarcaModelo} autos, mínimo ${MUESTRA_MINIMA})`,
      puntos: 4,
      cumple: tasaAlta,
    },
    {
      descripcion: `Año ${anio} (anterior a 2016)`,
      puntos: 4,
      cumple: anio < 2016,
    },
    {
      descripcion: `${problemasRecurrentes} problemas recurrentes (más de 5)`,
      puntos: 2,
      cumple: problemasRecurrentes > 5,
    },
  ];

  const puntaje = criterios.reduce((acc, c) => acc + (c.cumple ? c.puntos : 0), 0);

  const nivel: NivelCangrejo =
    puntaje >= 8 ? "MUY PROBABLE" :
    puntaje >= 5 ? "PROBABLE" : "POCO PROBABLE";

  return { puntaje, maximo: 10, nivel, criterios };
}

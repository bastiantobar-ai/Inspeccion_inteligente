/**
 * ÍNDICE DE RIESGO de cangrejo — combinación ponderada de dos señales:
 *
 *   riesgo por CQI ......... 30% de peso
 *   riesgo por tasa ......... 70% de peso
 *   indice (0-100) = 0,3 × riesgoCqi + 0,7 × riesgoTasa
 *
 * OJO — no es una probabilidad. Un índice de 92 NO significa 92% de
 * chance de ser cangrejo: significa que el modelo está en lo más alto
 * de la escala de riesgo relativo. La probabilidad real la da
 * `tasa.tasaMm` (la tasa observada del grupo), que en la práctica
 * ronda el 1-5% porque el evento es raro (base global ~0,55%).
 *
 * Reemplaza al puntaje aditivo anterior (0-10 con año/tasa/recurrentes
 * como criterios independientes). Ahora "año" ya no es un criterio
 * propio: entra indirectamente vía el CQI (que lo usa como uno de
 * sus factores), así que sumarlo aparte hubiera sido contarlo dos
 * veces. "Problemas recurrentes" quedó fuera de este indicador —
 * sigue visible en la tarjeta de OTs, pero no entra en el índice.
 *
 * ── riesgoCqi (0-100) ──
 * El CQI (lib/cqi.ts) da un puntaje 0-100 donde 100 = mejor calidad
 * (todo A). El riesgo es lo inverso: riesgoCqi = 100 - cqi.puntaje.
 *
 * ── riesgoTasa (0-100) ──
 * Viene de vecesBase = (cangrejos_mm / autos_mm) / tasa_base_global,
 * calculado en Supabase por tasa_cangrejo_grupo. Se topa en
 * TOPE_VECES_BASE para que un grupo con pocos autos y 1 cangrejo
 * (que puede dar 50x o más) no domine el promedio.
 *
 *   riesgoTasa = min(vecesBase, TOPE) / TOPE × 100
 *
 * El tope estuvo en 3x, heredado del modelo estadístico viejo, cuando
 * la tasa base era ~6,5% (denominador = autos con OTs). Al pasar el
 * denominador a `stock` completo la base cayó a ~0,55%, así que los
 * múltiplos se estiran mucho más y 3x dejó de ser "el techo": un
 * grupo con 1,64% de tasa daba exactamente 3x y topeaba el
 * componente en 100, empujando el índice a 92,5 — absurdo para un
 * evento con 1,64% de chance real.
 *
 * TOPE_VECES_BASE = 10 es un valor interino, elegido para que 3x
 * quede en 30 (riesgo moderado) y no en el máximo. NO está calibrado
 * contra la distribución real de vecesBase entre grupos; conviene
 * medir esa distribución y fijarlo en un percentil alto (p90/p95).
 *
 * Sin muestra confiable (autos_mm < MUESTRA_MINIMA) o sin exposición
 * registrada, no hay forma de estimar la tasa real: se asume 1x la
 * base (ni castiga ni premia por falta de dato), en vez de tratarlo
 * como 0 (que bajaría el riesgo artificialmente) o dejar que un
 * cálculo con n=1 dispare el promedio.
 *
 * Lectura del índice (0-100, NO es probabilidad):
 *   < 30   → riesgo bajo
 *   30-59  → riesgo medio
 *   >= 60  → riesgo alto
 */

const PESO_CQI = 0.3;
const PESO_TASA = 0.7;
const TOPE_VECES_BASE = 10;
const MUESTRA_MINIMA = 5;

export type NivelCangrejo = "RIESGO BAJO" | "RIESGO MEDIO" | "RIESGO ALTO";

export type ResultadoIndiceCangrejo = {
  indice: number;
  nivel: NivelCangrejo;
  muestraSuficiente: boolean;
  componentes: {
    cqi: { puntaje: number; riesgo: number; pesoPct: number };
    tasa: { vecesBaseUsado: number; riesgo: number; pesoPct: number; tope: number };
  };
};

export function calcularIndiceCangrejo(params: {
  /** cqi.puntaje de lib/cqi.ts, 0-100 (100 = mejor calidad). */
  cqiPuntaje: number;
  /** veces_base de tasa_cangrejo_grupo. null si autos_mm = 0. */
  vecesBase: number | null;
  /** autos_mm de tasa_cangrejo_grupo — exposición del grupo. */
  autosMarcaModelo: number;
}): ResultadoIndiceCangrejo {
  const { cqiPuntaje, vecesBase, autosMarcaModelo } = params;

  const muestraSuficiente = autosMarcaModelo >= MUESTRA_MINIMA;
  const vecesBaseUsado = muestraSuficiente && vecesBase != null ? vecesBase : 1;

  const riesgoCqi = 100 - cqiPuntaje;
  const riesgoTasa = (Math.min(vecesBaseUsado, TOPE_VECES_BASE) / TOPE_VECES_BASE) * 100;

  const indice = PESO_CQI * riesgoCqi + PESO_TASA * riesgoTasa;

  const nivel: NivelCangrejo =
    indice >= 60 ? "RIESGO ALTO" :
    indice >= 30 ? "RIESGO MEDIO" : "RIESGO BAJO";

  return {
    indice: Math.round(indice * 10) / 10,
    nivel,
    muestraSuficiente,
    componentes: {
      cqi: { puntaje: cqiPuntaje, riesgo: Math.round(riesgoCqi * 10) / 10, pesoPct: PESO_CQI * 100 },
      tasa: {
        vecesBaseUsado,
        riesgo: Math.round(riesgoTasa * 10) / 10,
        pesoPct: PESO_TASA * 100,
        tope: TOPE_VECES_BASE,
      },
    },
  };
}

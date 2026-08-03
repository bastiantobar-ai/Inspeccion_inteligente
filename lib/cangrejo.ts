/**
 * Probabilidad de CANGREJO — combinación ponderada de dos señales:
 *
 *   riesgo por CQI ......... 30% de peso
 *   riesgo por tasa ......... 70% de peso
 *   probabilidad (%) = 0,3 × riesgoCqi + 0,7 × riesgoTasa
 *
 * Reemplaza al puntaje aditivo anterior (0-10 con año/tasa/recurrentes
 * como criterios independientes). Ahora "año" ya no es un criterio
 * propio: entra indirectamente vía el CQI (que lo usa como uno de
 * sus factores), así que sumarlo aparte hubiera sido contarlo dos
 * veces. "Problemas recurrentes" quedó fuera de este indicador —
 * sigue visible como titular de la tarjeta de OTs, pero no entra en
 * la probabilidad de cangrejo.
 *
 * ── riesgoCqi (0-100) ──
 * El CQI (lib/cqi.ts) da un puntaje 0-100 donde 100 = mejor calidad
 * (todo A). El riesgo es lo inverso: riesgoCqi = 100 - cqi.puntaje.
 *
 * ── riesgoTasa (0-100) ──
 * Viene de vecesBase = (cangrejos_mm / autos_mm) / tasa_base_global,
 * calculado en Supabase por tasa_cangrejo_grupo. Se topa en 3x: un
 * grupo con 3 veces la tasa base ya es el máximo riesgo posible por
 * este componente (mismo corte que usaba el modelo estadístico
 * anterior para "MUY ALTA"). Sin ese tope, un grupo con muy pocos
 * autos y 1 cangrejo podría dar 20x o más y dominar el promedio.
 *
 *   riesgoTasa = min(vecesBase, 3) / 3 × 100
 *
 * Sin muestra confiable (autos_mm < MUESTRA_MINIMA) o sin exposición
 * registrada, no hay forma de estimar la tasa real: se asume 1x la
 * base (ni castiga ni premia por falta de dato), en vez de tratarlo
 * como 0 (que bajaría el riesgo artificialmente) o dejar que un
 * cálculo con n=1 dispare el promedio.
 *
 * Lectura del % final:
 *   < 30   → poco probable
 *   30-59  → probable
 *   >= 60  → muy probable
 */

const PESO_CQI = 0.3;
const PESO_TASA = 0.7;
const TOPE_VECES_BASE = 3;
const MUESTRA_MINIMA = 5;

export type NivelCangrejo = "POCO PROBABLE" | "PROBABLE" | "MUY PROBABLE";

export type ResultadoProbabilidadCangrejo = {
  porcentaje: number;
  nivel: NivelCangrejo;
  muestraSuficiente: boolean;
  componentes: {
    cqi: { puntaje: number; riesgo: number; pesoPct: number };
    tasa: { vecesBaseUsado: number; riesgo: number; pesoPct: number };
  };
};

export function calcularProbabilidadCangrejo(params: {
  /** cqi.puntaje de lib/cqi.ts, 0-100 (100 = mejor calidad). */
  cqiPuntaje: number;
  /** veces_base de tasa_cangrejo_grupo. null si autos_mm = 0. */
  vecesBase: number | null;
  /** autos_mm de tasa_cangrejo_grupo — exposición del grupo. */
  autosMarcaModelo: number;
}): ResultadoProbabilidadCangrejo {
  const { cqiPuntaje, vecesBase, autosMarcaModelo } = params;

  const muestraSuficiente = autosMarcaModelo >= MUESTRA_MINIMA;
  const vecesBaseUsado = muestraSuficiente && vecesBase != null ? vecesBase : 1;

  const riesgoCqi = 100 - cqiPuntaje;
  const riesgoTasa = (Math.min(vecesBaseUsado, TOPE_VECES_BASE) / TOPE_VECES_BASE) * 100;

  const porcentaje = PESO_CQI * riesgoCqi + PESO_TASA * riesgoTasa;

  const nivel: NivelCangrejo =
    porcentaje >= 60 ? "MUY PROBABLE" :
    porcentaje >= 30 ? "PROBABLE" : "POCO PROBABLE";

  return {
    porcentaje: Math.round(porcentaje * 10) / 10,
    nivel,
    muestraSuficiente,
    componentes: {
      cqi: { puntaje: cqiPuntaje, riesgo: Math.round(riesgoCqi * 10) / 10, pesoPct: PESO_CQI * 100 },
      tasa: { vecesBaseUsado, riesgo: Math.round(riesgoTasa * 10) / 10, pesoPct: PESO_TASA * 100 },
    },
  };
}

/**
 * ÍNDICE DE RIESGO de cangrejo — combinación ponderada de dos señales:
 *
 *   riesgo por IQI ......... 30% de peso
 *   riesgo por tasa ......... 70% de peso
 *   indice (0-100) = 0,3 × riesgoIqi + 0,7 × riesgoTasa
 *
 * OJO — no es una probabilidad. Un índice de 92 NO significa 92% de
 * chance de ser cangrejo: significa que el modelo está en lo más alto
 * de la escala de riesgo relativo. La probabilidad real la da
 * `tasa.tasaMm` (la tasa observada del grupo), que en la práctica
 * ronda el 1-5% porque el evento es raro (base global ~0,55%).
 *
 * Reemplaza al puntaje aditivo anterior (0-10 con año/tasa/recurrentes
 * como criterios independientes). Ahora "año" ya no es un criterio
 * propio: entra indirectamente vía el IQI (que lo usa como uno de
 * sus factores), así que sumarlo aparte hubiera sido contarlo dos
 * veces. "Problemas recurrentes" quedó fuera de este indicador —
 * sigue visible en la tarjeta de OTs, pero no entra en el índice.
 *
 * ── riesgoIqi (0-100) ──
 * El IQI (lib/iqi.ts) usa la fórmula de la hoja: promedio de los
 * factores (A=100 … E=20), así que su puntaje va de 100 (todo A) a
 * 20 (todo E), NO a 0. Acá se reescala ese 20-100 a un riesgo 0-100:
 *   riesgoIqi = (100 - iqi.puntaje) / (100 - 20) × 100
 * Da 0 con el mejor IQI (100) y 100 exactamente con el peor (todo E → 20).
 *
 * ── riesgoTasa (0-100) — escala contra el PEOR CASO REAL ──
 * Viene de vecesBase = (cangrejos_mm / autos_mm) / tasa_base_global,
 * calculado en Supabase por tasa_cangrejo_grupo.
 *
 * Historial de esta fórmula (dos versiones descartadas):
 *   1. min(vecesBase, TOPE)/TOPE×100 con TOPE=10 inventado: un grupo
 *      en 10x y uno en 54x daban el mismo riesgo (100) — salto
 *      brusco e injusto, capaba antes de tiempo.
 *   2. Curva de saturación 100×vecesBase/(vecesBase+K): sin salto,
 *      pero asintótica — nunca llega exactamente a 100, ni con el
 *      peor caso posible. El pedido explícito era que SÍ se pudiera
 *      alcanzar 100 en el peor caso real.
 *
 * Ahora: escala LINEAL contra maxVecesBase, que es el vecesBase del
 * peor grupo real de la base (mayor tasa de cangrejo relativa a la
 * base, entre marca+modelo con exposición confiable >= muestra
 * mínima). No es un número inventado: es el techo que YA existe en
 * la data. Por eso no hay "salto brusco antes de tiempo" (nada en
 * la data supera ese valor, por definición) y el 100 SÍ es
 * alcanzable — es exactamente el auto con peor IQI y la tasa de
 * cangrejo más alta registrada.
 *
 *   riesgoTasa = min(vecesBase, maxVecesBase) / maxVecesBase × 100
 *
 * maxVecesBase NO se hardcodea acá: lo calcula en vivo la función
 * SQL max_veces_base_cangrejo() (ver funciones_riesgo.sql) y lo pasa
 * route.ts como parámetro. Así, si el mes que viene un modelo nuevo
 * empeora el peor caso, el techo se mueve solo — sin tocar código.
 * DEFAULT_MAX_VECES_BASE es solo el resguardo si esa RPC falla o
 * devuelve null (no hay grupos con muestra suficiente todavía).
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
 *   100    → el peor caso real: IQI todo E + la tasa de cangrejo
 *            más alta entre todos los marca+modelo de la base.
 */

const PESO_IQI = 0.3;
const PESO_TASA = 0.7;
const MUESTRA_MINIMA = 5;
// Peor puntaje IQI posible con la fórmula de la hoja (todo factor 'E'
// → promedio de 20). Se usa para reescalar el riesgo por IQI a 0-100.
const IQI_PUNTAJE_MIN = 20;
// Resguardo si max_veces_base_cangrejo() falla o devuelve null — no
// es el valor real, es solo para que el índice siga calculando algo
// razonable en vez de romperse.
const DEFAULT_MAX_VECES_BASE = 20;

export type NivelCangrejo = "RIESGO BAJO" | "RIESGO MEDIO" | "RIESGO ALTO";

export type ResultadoIndiceCangrejo = {
  indice: number;
  nivel: NivelCangrejo;
  muestraSuficiente: boolean;
  componentes: {
    iqi: { puntaje: number; riesgo: number; pesoPct: number };
    tasa: { vecesBaseUsado: number; riesgo: number; pesoPct: number; maxVecesBase: number };
  };
};

export function calcularIndiceCangrejo(params: {
  /** iqi.puntaje de lib/iqi.ts, 20-100 (100 = todo A, 20 = todo E). */
  iqiPuntaje: number;
  /** veces_base de tasa_cangrejo_grupo. null si autos_mm = 0. */
  vecesBase: number | null;
  /** autos_mm de tasa_cangrejo_grupo — exposición del grupo. */
  autosMarcaModelo: number;
  /**
   * Peor vecesBase real de toda la base, calculado en vivo por
   * max_veces_base_cangrejo() en Supabase. null/undefined usa
   * DEFAULT_MAX_VECES_BASE como resguardo.
   */
  maxVecesBase?: number | null;
}): ResultadoIndiceCangrejo {
  const { iqiPuntaje, vecesBase, autosMarcaModelo } = params;
  const maxVecesBase = params.maxVecesBase ?? DEFAULT_MAX_VECES_BASE;

  const muestraSuficiente = autosMarcaModelo >= MUESTRA_MINIMA;
  const vecesBaseUsado = muestraSuficiente && vecesBase != null ? vecesBase : 1;

  // Reescala el puntaje IQI (20-100) a un riesgo 0-100.
  const riesgoIqi = Math.max(
    0,
    Math.min(100, ((100 - iqiPuntaje) / (100 - IQI_PUNTAJE_MIN)) * 100)
  );
  // Lineal contra el peor caso real — el 100 es alcanzable exactamente ahí.
  const riesgoTasa = (Math.min(vecesBaseUsado, maxVecesBase) / maxVecesBase) * 100;

  const indice = PESO_IQI * riesgoIqi + PESO_TASA * riesgoTasa;

  const nivel: NivelCangrejo =
    indice >= 60 ? "RIESGO ALTO" :
    indice >= 30 ? "RIESGO MEDIO" : "RIESGO BAJO";

  return {
    indice: Math.round(indice * 10) / 10,
    nivel,
    muestraSuficiente,
    componentes: {
      iqi: { puntaje: iqiPuntaje, riesgo: Math.round(riesgoIqi * 10) / 10, pesoPct: PESO_IQI * 100 },
      tasa: {
        vecesBaseUsado,
        riesgo: Math.round(riesgoTasa * 10) / 10,
        pesoPct: PESO_TASA * 100,
        maxVecesBase,
      },
    },
  };
}

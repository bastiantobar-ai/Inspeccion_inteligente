/**
 * Riesgo de CANGREJO — puntaje aditivo de 0 a 10.
 *
 * Se descartó devolver una probabilidad absoluta (%): la tasa base
 * real ronda el 1%, así que hasta un caso de riesgo alto mostraba
 * "1,8%" y resultaba ilegible. El puntaje 0-10 es directo.
 *
 * Criterios (suman 10 en el peor caso):
 *   Cangrejos previos del modelo > 2 ..... 4 pts
 *   Año anterior a 2016 .................. 4 pts
 *   Más de 5 problemas recurrentes ....... 2 pts
 *
 * Reparto de pesos. Con 3 criterios binarios hay 8 combinaciones,
 * así que los pesos definen toda la tabla de resultados:
 *
 *   ninguno ....................  0  POCO PROBABLE
 *   solo recurrentes ...........  2  POCO PROBABLE
 *   solo año / solo cangrejos ..  4  POCO PROBABLE
 *   año + recurrentes ..........  6  PROBABLE
 *   cangrejos + recurrentes ....  6  PROBABLE
 *   año + cangrejos ............  8  MUY PROBABLE
 *   los tres ................... 10  MUY PROBABLE
 *
 * Ningún criterio por sí solo llega a PROBABLE: hacen falta dos
 * señales, para no alarmar por un dato aislado. Se probó 4/3/3 pero
 * dejaba un único camino a MUY PROBABLE (los tres a la vez).
 *
 * Justificación de cada peso, medida contra la base real:
 *   · Cangrejos previos (4): evidencia directa — el modelo ya
 *     produjo cangrejos. Es el más fuerte, aunque circular.
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
  cangrejosMarcaModelo: number;
}): ResultadoCangrejo {
  const { anio, problemasRecurrentes, cangrejosMarcaModelo } = params;

  const criterios: CriterioCangrejo[] = [
    {
      descripcion: `${cangrejosMarcaModelo} cangrejos previos del modelo (más de 2)`,
      puntos: 4,
      cumple: cangrejosMarcaModelo > 2,
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

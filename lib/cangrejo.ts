/**
 * Riesgo de CANGREJO — puntaje aditivo de 0 a 10.
 *
 * Reemplaza al índice estadístico anterior (encogimiento jerárquico),
 * que devolvía una probabilidad absoluta difícil de leer: como la tasa
 * base real es ~1%, hasta un caso "ALTA" mostraba 1,8% y confundía.
 * Este modelo es directo: se suman puntos por criterio observable.
 *
 * Criterios (suman 10 en el peor caso):
 *   CQI D o E ............................ 2 pts
 *   Año anterior a 2016 .................. 3 pts
 *   Más de 5 problemas recurrentes ....... 2 pts
 *   Marca+modelo ya es cangrejo >2 veces . 3 pts
 *
 * "Problema recurrente" = work_item_name con más de 3 OTs en el
 * grupo. Es el mismo número que la tarjeta muestra como titular.
 *
 * Sobre el criterio de OTs: la primera versión contaba ítems de
 * trabajo DISTINTOS con umbral 10, pero se cumplía en el 100% de
 * los casos reales (el mínimo medido fue 64) — era un +2 constante.
 * Además crecía con el tamaño de la flota, así que medía
 * popularidad del modelo, no riesgo. Contar solo los recurrentes
 * corrige eso: exige que el problema se repita, no que exista.
 *
 * Lectura:
 *   < 5   → poco probable
 *   5 a 7 → existe probabilidad
 *   >= 8  → muy probable
 */

import type { Cqi } from "./cqi";

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
  cqi: Cqi;
  anio: number;
  problemasRecurrentes: number;
  cangrejosMarcaModelo: number;
}): ResultadoCangrejo {
  const { cqi, anio, problemasRecurrentes, cangrejosMarcaModelo } = params;

  const criterios: CriterioCangrejo[] = [
    {
      descripcion: `CQI ${cqi} (D o E)`,
      puntos: 2,
      cumple: cqi === "D" || cqi === "E",
    },
    {
      descripcion: `Año ${anio} (anterior a 2016)`,
      puntos: 3,
      cumple: anio < 2016,
    },
    {
      descripcion: `${problemasRecurrentes} problemas recurrentes (más de 5)`,
      puntos: 2,
      cumple: problemasRecurrentes > 5,
    },
    {
      descripcion: `${cangrejosMarcaModelo} cangrejos previos del modelo (más de 2)`,
      puntos: 3,
      cumple: cangrejosMarcaModelo > 2,
    },
  ];

  const puntaje = criterios.reduce((acc, c) => acc + (c.cumple ? c.puntos : 0), 0);

  const nivel: NivelCangrejo =
    puntaje >= 8 ? "MUY PROBABLE" :
    puntaje >= 5 ? "PROBABLE" : "POCO PROBABLE";

  return { puntaje, maximo: 10, nivel, criterios };
}

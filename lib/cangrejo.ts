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
 *   Más de 10 tipos de OT distintos ...... 3 pts
 *   Marca+modelo ya es cangrejo >2 veces . 2 pts
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
  tiposOtsDistintos: number;
  cangrejosMarcaModelo: number;
}): ResultadoCangrejo {
  const { cqi, anio, tiposOtsDistintos, cangrejosMarcaModelo } = params;

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
      descripcion: `${tiposOtsDistintos} tipos de OT distintos (más de 10)`,
      puntos: 3,
      cumple: tiposOtsDistintos > 10,
    },
    {
      descripcion: `${cangrejosMarcaModelo} cangrejos previos del modelo (más de 2)`,
      puntos: 2,
      cumple: cangrejosMarcaModelo > 2,
    },
  ];

  const puntaje = criterios.reduce((acc, c) => acc + (c.cumple ? c.puntos : 0), 0);

  const nivel: NivelCangrejo =
    puntaje >= 8 ? "MUY PROBABLE" :
    puntaje >= 5 ? "PROBABLE" : "POCO PROBABLE";

  return { puntaje, maximo: 10, nivel, criterios };
}

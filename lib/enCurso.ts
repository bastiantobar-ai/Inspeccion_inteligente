// Inspecciones abiertas en ESTE navegador, guardadas en localStorage como
// { [consultaId]: último latido (ms) }. Cada pestaña solo escribe su propio
// id; una entrada se considera abandonada cuando su latido es viejo, así una
// pestaña viva nunca es cerrada por otra. Todo va en try/catch: si el
// storage falla (modo privado, bloqueado) la app sigue funcionando.

const KEY = "kriterio.enCurso";
export const LATIDO_MS = 10_000;
// Mayor que el throttling de pestañas en segundo plano de los navegadores.
const ABANDONADA_MS = 90_000;

type Mapa = Record<string, number>;

function leer(): Mapa {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Mapa;
  } catch {
    return {};
  }
}

function escribir(m: Mapa) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {}
}

export function marcarEnCurso(id: number) {
  const m = leer();
  m[String(id)] = Date.now();
  escribir(m);
}

export function quitarEnCurso(id: number) {
  const m = leer();
  delete m[String(id)];
  escribir(m);
}

export function abandonadas(): number[] {
  const ahora = Date.now();
  return Object.entries(leer())
    .filter(([, t]) => ahora - t > ABANDONADA_MS)
    .map(([id]) => Number(id));
}

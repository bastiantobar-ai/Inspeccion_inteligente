"use client";

import { useState } from "react";

type Opciones = { marca: string[]; modelo: string[]; version: string[]; anio: string[] };

async function fetchOpciones(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/catalogo?${qs}`);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || "Error cargando opciones");
  return (json.valores ?? []) as string[];
}

export default function Home() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [version, setVersion] = useState("");
  const [anio, setAnio] = useState("");
  const [km, setKm] = useState("");
  const [email, setEmail] = useState("");
  const [opciones, setOpciones] = useState<Opciones>({ marca: [], modelo: [], version: [], anio: [] });
  const [sinVersion, setSinVersion] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onMarcaFocus() {
    if (opciones.marca.length) return;
    try {
      const valores = await fetchOpciones({});
      setOpciones((o) => ({ ...o, marca: valores }));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }

  async function onChangeMarca(v: string) {
    setMarca(v);
    setModelo(""); setVersion(""); setAnio(""); setSinVersion(false);
    try {
      const valores = await fetchOpciones({ marca: v });
      setOpciones((o) => ({ ...o, modelo: valores, version: [], anio: [] }));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }

  async function onChangeModelo(v: string) {
    setModelo(v);
    setVersion(""); setAnio(""); setSinVersion(false);
    try {
      const valores = await fetchOpciones({ marca, modelo: v });
      setOpciones((o) => ({ ...o, version: valores, anio: [] }));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }

  async function onChangeVersion(v: string) {
    setVersion(v);
    setAnio(""); setSinVersion(false);
    try {
      const valores = await fetchOpciones({ marca, modelo, version: v });
      setOpciones((o) => ({ ...o, anio: valores }));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }

  async function onToggleSinVersion() {
    if (sinVersion) {
      setSinVersion(false);
      setAnio("");
      setOpciones((o) => ({ ...o, anio: [] }));
      return;
    }
    setVersion(""); setAnio(""); setSinVersion(true);
    try {
      const valores = await fetchOpciones({ marca, modelo, skipVersion: "true" });
      setOpciones((o) => ({ ...o, anio: valores }));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }

  async function generarChecklist() {
    setCargando(true);
    setResultado(null);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca, modelo, version: sinVersion ? undefined : version, anio: Number(anio),
          km: km ? Number(km) : undefined,
          email: email || undefined,
        }),
      });
      setResultado(await res.json());
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold">Inspección Inteligente</h1>
      <p className="text-gray-500 mb-6">Sistema de generación de checklists con IA</p>

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-800 rounded p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">🔍 Búsqueda de Vehículo</h2>

        <div>
          <label className="block text-sm mb-1">Marca</label>
          <select className="border rounded w-full p-2" value={marca} onFocus={onMarcaFocus}
            onChange={(e) => onChangeMarca(e.target.value)}>
            <option value="">Selecciona...</option>
            {opciones.marca.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Modelo</label>
          <select className="border rounded w-full p-2" value={modelo} disabled={!marca}
            onChange={(e) => onChangeModelo(e.target.value)}>
            <option value="">Selecciona...</option>
            {opciones.modelo.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Versión (opcional)</label>
          <select className="border rounded w-full p-2" value={version} disabled={!modelo || sinVersion}
            onChange={(e) => onChangeVersion(e.target.value)}>
            <option value="">Selecciona...</option>
            {opciones.version.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          {modelo && !version && (
            <button type="button" onClick={onToggleSinVersion}
              className={`text-xs mt-1 underline ${sinVersion ? "text-black font-medium" : "text-gray-500"}`}>
              {sinVersion ? "✓ Sin versión específica (click para elegir una)" : "No tengo la versión, continuar sin ella"}
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Año</label>
          <select className="border rounded w-full p-2" value={anio} disabled={!version && !sinVersion}
            onChange={(e) => setAnio(e.target.value)}>
            <option value="">Selecciona...</option>
            {opciones.anio.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Kilometraje (opcional)</label>
          <input type="number" className="border rounded w-full p-2" placeholder="Ej: 50000"
            value={km} onChange={(e) => setKm(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Email (opcional)</label>
          <input type="email" className="border rounded w-full p-2" placeholder="tu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <button
          className="w-full bg-black text-white rounded p-2 disabled:opacity-40"
          disabled={!anio || cargando}
          onClick={generarChecklist}
        >
          {cargando ? "Generando..." : "🚀 Generar Checklist"}
        </button>
      </section>

      {resultado && resultado.error && (
        <div className="border border-red-300 bg-red-50 text-red-800 rounded p-3 mt-4 text-sm">
          {resultado.error}
        </div>
      )}

      {resultado && !resultado.error && (
        <section className="border rounded-lg p-6 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">📋 Checklist Generado</h2>
            <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1">
              {resultado.items.length} items
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">CQI · Marca-Año-KM</div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    resultado.cqi.grado === "A" ? "text-green-600" :
                    resultado.cqi.grado === "B" ? "text-lime-600" :
                    resultado.cqi.grado === "C" ? "text-yellow-600" :
                    resultado.cqi.grado === "D" ? "text-orange-600" : "text-red-600"
                  }`}
                >
                  {resultado.cqi.grado}
                </span>
                <span className="text-xs text-gray-400">puntaje {resultado.cqi.puntaje}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex gap-2">
                <span>Año {resultado.cqi.buckets.anio}</span>
                <span>·</span>
                <span>KM {resultado.cqi.buckets.km ?? "—"}</span>
                <span>·</span>
                <span>Marca {resultado.cqi.buckets.marca}</span>
              </div>
              {resultado.cqi.parcial && (
                <div className="text-[10px] text-gray-400 mt-1">
                  Sin KM: calculado con 2 factores
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Probabilidad de cangrejo</div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    resultado.cangrejo.nivel === "MUY ALTA" ? "text-red-600" :
                    resultado.cangrejo.nivel === "ALTA" ? "text-orange-600" :
                    resultado.cangrejo.nivel === "MEDIA" ? "text-yellow-600" : "text-green-600"
                  }`}
                >
                  {resultado.cangrejo.probabilidad != null ? `${resultado.cangrejo.probabilidad}%` : "—"}
                </span>
                <span className="text-xs font-medium text-gray-600">{resultado.cangrejo.nivel}</span>
              </div>
              {resultado.cangrejo.vecesBase != null && (
                <div className="text-xs text-gray-500 mt-1">
                  {resultado.cangrejo.vecesBase}x la tasa base ({resultado.cangrejo.tasaBase}%)
                </div>
              )}
              {resultado.cangrejo.antiguedadRiesgo && (
                <div className="text-xs text-orange-700 mt-1">⚠️ Año &lt; 2016</div>
              )}
            </div>
          </div>

          {resultado.cangrejo.detalle && (
            <details className="border rounded-lg p-3 text-sm">
              <summary className="cursor-pointer font-medium">¿De dónde sale ese porcentaje?</summary>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <div>
                  Marca: {resultado.cangrejo.detalle.marca.cangrejos} cangrejos en{" "}
                  {resultado.cangrejo.detalle.marca.autos} autos → {resultado.cangrejo.detalle.marca.tasa}%
                </div>
                <div>
                  Modelo: {resultado.cangrejo.detalle.modelo.cangrejos} cangrejos en{" "}
                  {resultado.cangrejo.detalle.modelo.autos} autos → {resultado.cangrejo.detalle.modelo.tasa}%
                  <span className="text-gray-400"> (ajustada hacia la marca si la muestra es chica)</span>
                </div>
                <div>Factor por año: ×{resultado.cangrejo.detalle.factorAnio}</div>
              </div>
            </details>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">📊 Datos históricos analizados:</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded p-3 text-center">
                <div className="text-red-600 font-bold">{resultado.stats.devoluciones} Devoluciones</div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-orange-600 font-bold">{resultado.stats.cangrejos} Cangrejos</div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-blue-600 font-bold mb-1">{resultado.stats.ots} Órdenes de Trabajo</div>
                <div className="text-[10px] text-gray-400 mb-1">con más de 3 OTs</div>
                <ul className="text-xs text-gray-600 text-left list-disc list-inside">
                  {resultado.stats.otsListado.map((o: string) => <li key={o}>{o}</li>)}
                </ul>
                {resultado.stats.otsBajoUmbral?.length > 0 && (
                  <div className="text-left mt-1">
                    <div className="text-[10px] text-gray-400">Ninguna supera 3 OTs. Antecedentes puntuales:</div>
                    <ul className="text-xs text-gray-500 list-disc list-inside">
                      {resultado.stats.otsBajoUmbral.map((o: string) => <li key={o}>{o}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {resultado.items.map((it: { titulo: string; tag: string; criticidad: number }, i: number) => (
              <details key={i} className="border rounded-lg p-3">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-sm">{it.titulo}</span>
                  <span className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-2 py-0.5">{it.tag}</span>
                    <span
                      className={`text-white text-xs rounded-full px-2 py-0.5 ${
                        it.criticidad >= 5 ? "bg-red-600" : it.criticidad >= 4 ? "bg-red-500" : "bg-gray-500"
                      }`}
                    >
                      Criticidad {it.criticidad}
                    </span>
                  </span>
                </summary>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

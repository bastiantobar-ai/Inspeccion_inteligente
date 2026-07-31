"use client";

import { useState } from "react";
import Combobox from "./components/Combobox";

type Opciones = { marca: string[]; modelo: string[]; version: string[]; anio: string[] };

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition " +
  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 " +
  "disabled:bg-gray-50 disabled:text-gray-400";
const LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1.5";

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
    <main className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Inspección Inteligente</h1>
        <p className="text-gray-500 mt-1">Sistema de generación de checklists con IA</p>
      </header>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 rounded-xl p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="font-semibold text-lg mb-5">🔍 Búsqueda de Vehículo</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          <Combobox
            label="Marca"
            value={marca}
            options={opciones.marca}
            onFocus={onMarcaFocus}
            onChange={onChangeMarca}
          />

          <Combobox
            label="Modelo"
            value={modelo}
            options={opciones.modelo}
            disabled={!marca}
            onChange={onChangeModelo}
          />

          <Combobox
            label={<>Versión <span className="font-normal text-gray-400">(opcional)</span></>}
            value={version}
            options={opciones.version}
            disabled={!modelo || sinVersion}
            onChange={onChangeVersion}
            accion={
              modelo ? (
                <button
                  type="button"
                  onClick={onToggleSinVersion}
                  title={sinVersion ? "Volver a elegir una versión" : "Continuar sin especificar la versión"}
                  className={
                    "shrink-0 rounded-full border px-2 py-0.5 text-[11px] leading-none transition " +
                    (sinVersion
                      ? "border-blue-200 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700")
                  }
                >
                  {sinVersion ? "✓ sin versión" : "no la tengo"}
                </button>
              ) : null
            }
          />

          <Combobox
            label="Año"
            value={anio}
            options={opciones.anio}
            disabled={!version && !sinVersion}
            onChange={setAnio}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label className={LABEL_CLASS}>Kilometraje <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="number" className={INPUT_CLASS} placeholder="Ej: 50000"
              value={km} onChange={(e) => setKm(e.target.value)} />
          </div>

          <div>
            <label className={LABEL_CLASS}>Email <span className="font-normal text-gray-400">(opcional)</span></label>
            <input type="email" className={INPUT_CLASS} placeholder="tu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm shadow-sm transition disabled:opacity-40 disabled:hover:bg-blue-600"
            disabled={!anio || cargando}
            onClick={generarChecklist}
          >
            {cargando ? "Generando..." : "🚀 Generar Checklist"}
          </button>
        </div>
      </section>

      {resultado && resultado.error && (
        <div className="border border-red-200 bg-red-50 text-red-800 rounded-xl p-3 mt-6 text-sm">
          {resultado.error}
        </div>
      )}

      {resultado && !resultado.error && (
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">📋 Checklist Generado</h2>
            <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-3 py-1">
              {resultado.items.length} items
            </span>
          </div>

          {resultado.inspeccionDiferenciada && (
            <div
              className={`border rounded-xl p-4 ${
                resultado.inspeccionDiferenciada.superaUmbral === true
                  ? "border-red-200 bg-red-50"
                  : resultado.inspeccionDiferenciada.superaUmbral === false
                  ? "border-gray-200 bg-gray-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="font-semibold text-sm">
                {resultado.inspeccionDiferenciada.superaUmbral === true
                  ? "⚠️ Requiere Inspección Diferenciada"
                  : resultado.inspeccionDiferenciada.superaUmbral === false
                  ? "ℹ️ Modelo con protocolo de Inspección Diferenciada"
                  : "⚠️ Este modelo puede requerir Inspección Diferenciada"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Umbral: {resultado.inspeccionDiferenciada.umbralKm.toLocaleString("es-CL")} km
                {resultado.inspeccionDiferenciada.superaUmbral === true &&
                  " · el vehículo supera el umbral"}
                {resultado.inspeccionDiferenciada.superaUmbral === false &&
                  " · el vehículo ingresado no lo supera"}
                {resultado.inspeccionDiferenciada.superaUmbral === null &&
                  " · ingresa el kilometraje para confirmar si aplica"}
              </div>
              {resultado.inspeccionDiferenciada.link && (
                <a
                  href={resultado.inspeccionDiferenciada.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline text-blue-700 mt-1.5 inline-block"
                >
                  Ver protocolo
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">CQI · Marca-Año-KM</div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-bold ${
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
              <div className="text-xs text-gray-500 mt-2 flex gap-2">
                <span>Año {resultado.cqi.buckets.anio}</span>
                <span className="text-gray-300">·</span>
                <span>KM {resultado.cqi.buckets.km ?? "—"}</span>
                <span className="text-gray-300">·</span>
                <span>Marca {resultado.cqi.buckets.marca}</span>
              </div>
              {resultado.cqi.parcial && (
                <div className="text-[11px] text-gray-400 mt-1">
                  Sin KM: calculado con 2 factores
                </div>
              )}
            </div>

            <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Riesgo de cangrejo</div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-bold ${
                    resultado.cangrejo.nivel === "MUY PROBABLE" ? "text-red-600" :
                    resultado.cangrejo.nivel === "PROBABLE" ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  {resultado.cangrejo.puntaje}
                </span>
                <span className="text-sm text-gray-400">/ {resultado.cangrejo.maximo}</span>
                <span className="text-xs font-medium text-gray-600 ml-1">{resultado.cangrejo.nivel}</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    resultado.cangrejo.nivel === "MUY PROBABLE" ? "bg-red-500" :
                    resultado.cangrejo.nivel === "PROBABLE" ? "bg-orange-500" : "bg-green-500"
                  }`}
                  style={{ width: `${(resultado.cangrejo.puntaje / resultado.cangrejo.maximo) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-gray-400 mt-1.5">
                menos de 5: poco probable · 5 a 7: probable · 8 o más: muy probable
              </div>
            </div>
          </div>

          {resultado.cangrejo.criterios && (
            <details className="border border-gray-100 rounded-xl p-4 text-sm">
              <summary className="cursor-pointer font-medium">¿De dónde sale ese puntaje?</summary>
              <ul className="mt-3 space-y-1.5">
                {resultado.cangrejo.criterios.map(
                  (c: { descripcion: string; puntos: number; cumple: boolean }) => (
                    <li
                      key={c.descripcion}
                      className={`flex items-center justify-between text-xs ${
                        c.cumple ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      <span>
                        {c.cumple ? "✓" : "○"} {c.descripcion}
                      </span>
                      <span className={c.cumple ? "font-semibold" : ""}>
                        {c.cumple ? `+${c.puntos}` : "0"}
                      </span>
                    </li>
                  )
                )}
                <li className="flex items-center justify-between text-xs font-semibold border-t border-gray-100 pt-1.5 mt-1.5">
                  <span>Total</span>
                  <span>{resultado.cangrejo.puntaje} / {resultado.cangrejo.maximo}</span>
                </li>
              </ul>
            </details>
          )}

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">📊 Datos históricos analizados:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{resultado.stats.devoluciones}</div>
                <div className="text-xs text-gray-500 mt-0.5">Devoluciones</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{resultado.stats.cangrejos}</div>
                <div className="text-xs text-gray-500 mt-0.5">Cangrejos</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      resultado.stats.ots > 5 ? "text-orange-600" : "text-blue-600"
                    }`}
                  >
                    {resultado.stats.ots}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {resultado.stats.ots === 1 ? "problema recurrente" : "problemas recurrentes"}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    con más de 3 OTs · de {resultado.stats.totalTiposOts} ítems en el historial
                  </div>
                  {resultado.stats.autosDelGrupo > 0 && (
                    <div className="text-[11px] text-gray-400 mt-1">
                      {resultado.stats.otsPorAuto} OTs/vehículo · {resultado.stats.autosDelGrupo} autos
                    </div>
                  )}
                </div>
                {resultado.stats.otsTop10?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-[11px] text-gray-400 mb-1">
                      Top {resultado.stats.otsTop10.length} por frecuencia:
                    </div>
                    <ul className="text-xs list-disc list-inside space-y-0.5">
                      {resultado.stats.otsTop10.map(
                        (o: { item: string; count: number; sobreUmbral: boolean }) => (
                          <li
                            key={o.item}
                            className={o.sobreUmbral ? "text-blue-700 font-semibold" : "text-gray-500"}
                          >
                            {o.item} ({o.count})
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {resultado.items.map((it: { titulo: string; tag: string; criticidad: number }, i: number) => (
              <details key={i} className="border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition">
                <summary className="flex items-center justify-between cursor-pointer gap-3">
                  <span className="font-medium text-sm">{it.titulo}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2.5 py-0.5">{it.tag}</span>
                    <span
                      className={`text-white text-xs rounded-full px-2.5 py-0.5 ${
                        it.criticidad >= 5 ? "bg-red-600" : it.criticidad >= 4 ? "bg-red-500" : "bg-gray-400"
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

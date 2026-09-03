"use client";

import { useState } from "react";
import Combobox from "./components/Combobox";
import { protocoloPorIqi, PROTOCOLO_HIBRIDO } from "@/lib/protocolos";
import { fallasPorMarca } from "@/lib/fallas_marca";

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
  // Pestaña del protocolo: "normal" (KJI por IQI) o "hibrido" (VH eléctrico/híbrido).
  const [tabProtocolo, setTabProtocolo] = useState<"normal" | "hibrido">("normal");

  // Protocolo de inspección que corresponde al grado de IQI FINAL.
  const protocolo =
    resultado && !resultado.error && resultado.iqi?.grado
      ? protocoloPorIqi(resultado.iqi.grado)
      : null;

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
    setTabProtocolo("normal");
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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Kriterio</h1>
      </header>

      {error && (
        <div className="border border-black bg-gray-50 text-black rounded-xl p-3 mb-4 text-sm">
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

      {marca && fallasPorMarca(marca) && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 mt-6">
          <div className="text-sm font-semibold flex items-center gap-2">
            🔎 Fallas conocidas de la marca · {marca}
          </div>
          <div className="text-[11px] text-gray-400 mb-3">
            Referencia externa (reliability surveys / recalls / foros) — no sale de la base de KAVAK
          </div>
          {(() => {
            const ref = fallasPorMarca(marca)!;
            return (
              <div className="space-y-2">
                <div className="text-xs text-gray-500">Modelo(s) / generación más problemático(s)</div>
                <div className="flex flex-wrap gap-1.5">
                  {ref.modelos.map((m) => (
                    <span
                      key={m}
                      className="text-xs bg-gray-100 text-gray-800 rounded-full px-2.5 py-1"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500 pt-1">Falla más representativa</div>
                <div className="text-sm text-gray-800">{ref.falla}</div>
                {ref.inferido && (
                  <div className="text-[11px] text-blue-700">
                    Patrón inferido de la marca (sin data del modelo puntual)
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {resultado && resultado.error && (
        <div className="border border-black bg-gray-50 text-black rounded-xl p-3 mt-6 text-sm">
          {resultado.error}
        </div>
      )}

      {resultado && !resultado.error && (
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 mt-6 space-y-5">
          <h2 className="text-lg font-bold">📋 Análisis del Vehículo</h2>

          {resultado.inspeccionDiferenciada && (
            <div
              className={`border rounded-xl p-4 ${
                resultado.inspeccionDiferenciada.superaUmbral === true
                  ? "border-black bg-gray-50"
                  : resultado.inspeccionDiferenciada.superaUmbral === false
                  ? "border-gray-200 bg-gray-50"
                  : "border-blue-200 bg-blue-50"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">IQI · Marca-Año-KM</div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-bold ${
                    resultado.iqi.grado === "A" ? "text-blue-600" :
                    resultado.iqi.grado === "B" ? "text-blue-500" :
                    resultado.iqi.grado === "C" ? "text-blue-400" :
                    resultado.iqi.grado === "D" ? "text-gray-500" : "text-black"
                  }`}
                >
                  {resultado.iqi.grado}
                </span>
                <span className="text-xs text-gray-400">puntaje {resultado.iqi.puntaje}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex gap-2">
                <span>Año {resultado.iqi.buckets.anio}</span>
                <span className="text-gray-300">·</span>
                <span>KM {resultado.iqi.buckets.km ?? "—"}</span>
                <span className="text-gray-300">·</span>
                <span>Marca {resultado.iqi.buckets.marca}</span>
              </div>
              {resultado.iqi.parcial && (
                <div className="text-[11px] text-gray-400 mt-1">
                  Sin KM: calculado con 2 factores
                </div>
              )}
              {resultado.iqi.marcaConGrado === false && (
                <div className="text-[11px] text-blue-700 mt-1">
                  Marca sin grado IQI cargado: se asumió C
                </div>
              )}
            </div>

            <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Tasa de cangrejo · modelo</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-black">
                  {resultado.cangrejo.tasa.tasaMm != null ? `${resultado.cangrejo.tasa.tasaMm}%` : "—"}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {resultado.cangrejo.tasa.cangrejosMm} cangrejos en {resultado.cangrejo.tasa.autosMm}{" "}
                {marca} {modelo}
              </div>
              <div className="text-[11px] text-gray-400">todos los años</div>
              <div className="text-[11px] text-gray-400 mt-1">
                base global: {resultado.cangrejo.tasa.tasaBase}%
                {resultado.cangrejo.tasa.vecesBase != null && ` · ${resultado.cangrejo.tasa.vecesBase}x`}
              </div>
            </div>

            <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Cangrejo · marca (score 0–1)</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-black">
                  {resultado.cangrejo.tasaMarca.score != null
                    ? resultado.cangrejo.tasaMarca.score.toFixed(2)
                    : "—"}
                </span>
                <span className="text-sm text-gray-400">/ 1</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${Math.round((resultado.cangrejo.tasaMarca.score ?? 0) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                tasa {resultado.cangrejo.tasaMarca.tasaMm != null ? `${resultado.cangrejo.tasaMarca.tasaMm}%` : "—"}
                {" "}({resultado.cangrejo.tasaMarca.cangrejosMm} en {resultado.cangrejo.tasaMarca.autosMm} {marca})
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                normalizado vs. la marca peor
                {resultado.cangrejo.tasaMarca.tasaMax != null
                  ? ` (${resultado.cangrejo.tasaMarca.tasaMax}%)`
                  : ""}
              </div>
            </div>
          </div>

          {protocolo && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Pestañas: Normal (KJI por IQI) / Híbrido (VH eléctrico-híbrido) */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setTabProtocolo("normal")}
                  className={`px-5 py-3 text-sm font-medium transition ${
                    tabProtocolo === "normal"
                      ? "bg-white text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Normal · IQI {protocolo.grado}
                </button>
                <button
                  type="button"
                  onClick={() => setTabProtocolo("hibrido")}
                  className={`px-5 py-3 text-sm font-medium transition ${
                    tabProtocolo === "hibrido"
                      ? "bg-white text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Híbrido / Eléctrico
                </button>
              </div>

              {tabProtocolo === "normal" ? (
                <>
                  <div className="bg-black text-white px-5 py-4">
                    <div className="text-[11px] uppercase tracking-wide text-gray-400">
                      Protocolo de inspección · IQI {protocolo.grado}
                    </div>
                    <div className="font-semibold text-base mt-0.5">
                      {protocolo.codigo} · {protocolo.nombre} · {protocolo.rev}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 divide-gray-100 border-b border-gray-100 text-center">
                    <div className="p-3">
                      <div className="text-[11px] text-gray-500">Tiempo objetivo</div>
                      <div className="text-lg font-bold text-gray-900">
                        {protocolo.tiempoObjetivoMin}–{protocolo.tiempoObjetivoMax} min
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-[11px] text-gray-500">Riesgo</div>
                      <div className="text-lg font-bold text-gray-900">{protocolo.riesgo}</div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-3">
                      <div className="text-[11px] text-gray-500">N° de etapas</div>
                      <div className="text-lg font-bold text-gray-900">{protocolo.etapas.length}</div>
                    </div>
                  </div>

                  <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
                    <span className="font-semibold">Aplica a: </span>
                    {protocolo.aplicaA}
                  </div>

                  <ol className="divide-y divide-gray-100">
                    {protocolo.etapas.map((e) => (
                      <li key={e.n} className="flex gap-3 p-4">
                        <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                          {e.n}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900">{e.etapa}</div>
                          <div className="mt-0.5 text-sm text-gray-700">{e.secuencia}</div>
                          <div className="mt-2 grid gap-1 sm:grid-cols-2 text-[11px] text-gray-500">
                            <div>
                              <span className="font-medium text-gray-600">Evidencia: </span>
                              {e.evidencia}
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Escalamiento: </span>
                              {e.escalamiento}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <>
                  <div className="bg-black text-white px-5 py-4">
                    <div className="text-[11px] uppercase tracking-wide text-gray-400">
                      Protocolo híbrido / eléctrico · fijo (no depende del IQI)
                    </div>
                    <div className="font-semibold text-base mt-0.5">
                      {PROTOCOLO_HIBRIDO.codigo} · {PROTOCOLO_HIBRIDO.nombre} · {PROTOCOLO_HIBRIDO.rev}
                    </div>
                  </div>

                  <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
                    <span className="font-semibold">Aplica a: </span>
                    {PROTOCOLO_HIBRIDO.aplicaA}
                  </div>
                  <div className="px-5 py-2 border-b border-gray-100 text-[11px] text-gray-500">
                    Deméritos: {PROTOCOLO_HIBRIDO.escalaDemeritos}
                  </div>

                  <ol className="divide-y divide-gray-100">
                    {PROTOCOLO_HIBRIDO.etapas.map((e) => (
                      <li key={e.n} className="flex gap-3 p-4">
                        <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                          {e.n}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] uppercase tracking-wide text-gray-400">
                            {e.grupo}
                          </div>
                          <div className="mt-0.5 text-sm text-gray-700">{e.secuencia}</div>
                          {e.link && (
                            <div className="mt-1 text-[11px] text-blue-600">{e.link}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">📊 Datos históricos analizados:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-black">{resultado.stats.devoluciones}</div>
                <div className="text-xs text-gray-500 mt-0.5">Devoluciones</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {marca} {modelo}
                  {resultado.stats.pctDevoluciones != null
                    ? ` · ${resultado.stats.pctDevoluciones}% del modelo`
                    : ""}
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-black">{resultado.stats.cangrejos}</div>
                <div className="text-xs text-gray-500 mt-0.5">Cangrejos</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {marca} {modelo} · de {resultado.cangrejo.tasa.autosMm} autos
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{resultado.stats.autosDelGrupo}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {marca} {modelo} <span className="text-gray-400">· todos los años</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {resultado.stats.totalTiposOts} fallas distintas · {resultado.stats.otsPorAuto} OTs/auto
                </div>
              </div>
            </div>

            {resultado.stats.otsTop10?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-lg p-4 mt-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">
                  Fallas más frecuentes del modelo
                </h4>
                <ul className="space-y-2">
                  {resultado.stats.otsTop10.map(
                    (o: {
                      item: string;
                      autos: number;
                      count: number;
                      pct: number | null;
                    }) => (
                      <li key={o.item}>
                        <div className="flex items-baseline justify-between gap-3 text-xs">
                          <span className="text-gray-700 truncate">{o.item}</span>
                          <span className="shrink-0 font-semibold text-blue-700">
                            {o.pct != null ? `${o.pct}%` : "—"}
                            <span className="font-normal text-gray-400">
                              {" "}
                              ({o.autos}/{resultado.stats.autosDelGrupo})
                            </span>
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.min(o.pct ?? 0, 100)}%` }}
                          />
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

        </section>
      )}
    </main>
  );
}

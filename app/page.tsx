"use client";

import { useState, type SVGProps } from "react";
import Combobox from "./components/Combobox";
import { protocoloPorIqi, PROTOCOLO_HIBRIDO } from "@/lib/protocolos";
import { fallasPorMarca } from "@/lib/fallas_marca";

type Opciones = { marca: string[]; modelo: string[]; version: string[]; anio: string[] };

const INPUT_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition " +
  "placeholder:text-ink-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 " +
  "disabled:bg-paper disabled:text-ink-3";
const LABEL_CLASS = "block text-[13px] font-medium text-ink-2 mb-1.5";
const CARD = "rounded-xl border border-line bg-white shadow-card";
const EYEBROW =
  "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-3";
const MINI_LABEL = "text-[11px] font-medium uppercase tracking-[0.05em] text-ink-3";

// Escala de color del grado IQI (se mantiene el semáforo A→E).
const GRADE_TEXT: Record<string, string> = {
  A: "text-green-600",
  B: "text-lime-600",
  C: "text-yellow-600",
  D: "text-orange-600",
  E: "text-red-600",
};
const GRADE_BG: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-lime-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  E: "bg-red-500",
};

/* ── Íconos (línea, 24px grid) ─────────────────────────────── */
const iconBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const IcoSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></svg>
);
const IcoClipboard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <rect x="8" y="4" width="8" height="4" rx="1" />
    <path d="M16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
    <path d="m9 13 2 2 4-4" />
  </svg>
);
const IcoChart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}><path d="M4 20h16" /><rect x="6" y="11" width="3.2" height="7" rx="0.6" /><rect x="13" y="7" width="3.2" height="11" rx="0.6" /></svg>
);
const IcoRadar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M12 12 19 6" /></svg>
);
const IcoInfo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>
);
const IcoAlert = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}><path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
);
const IcoExternal = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}><path d="M14 5h5v5" /><path d="M19 5 10 14" /><path d="M19 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" /></svg>
);
const IcoCrab = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M6 13.6c0-2.9 2.7-4.6 6-4.6s6 1.7 6 4.6c0 2.5-2.7 3.9-6 3.9s-6-1.4-6-3.9Z"
      fill="currentColor"
    />
    <circle cx="9.5" cy="8.2" r="1.15" fill="currentColor" />
    <circle cx="14.5" cy="8.2" r="1.15" fill="currentColor" />
    <path
      d="M9.5 9.3v1M14.5 9.3v1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6.4 12.7C3.8 12.1 2.6 9.7 4 7.8c-.9 1.1-.7 2.6.8 3M17.6 12.7c2.6-.6 3.8-3 2.4-4.9.9 1.1.7 2.6-.8 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.6 15.7 5.2 17.7M9 16.8 7.1 19M16.4 15.7 18.8 17.7M15 16.8 16.9 19"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

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
        }),
      });
      setResultado(await res.json());
    } finally {
      setCargando(false);
    }
  }

  const ref = marca ? fallasPorMarca(marca) : null;

  return (
    <div className="min-h-screen">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white">
              <IcoCrab className="h-[17px] w-[17px]" />
            </span>
            <span className="font-display text-[18px] font-semibold tracking-[0.03em]">
              <span className="text-blue-600">K</span>
              <span className="text-ink">riterio</span>
            </span>
          </div>
          <span className="font-display text-[13px] font-bold uppercase tracking-[0.24em] text-ink">
            KAVAK
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-2 shadow-card">
            <IcoAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
            {error}
          </div>
        )}

        {/* Búsqueda de vehículo */}
        <section className={`${CARD} p-5 sm:p-6`}>
          <div className={EYEBROW}>
            <IcoSearch className="h-3.5 w-3.5" />
            Búsqueda de vehículo
          </div>

          <div className="mt-4 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              label={<>Versión <span className="font-normal text-ink-3">(opcional)</span></>}
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
                        : "border-line text-ink-3 hover:border-ink-3/40 hover:bg-paper hover:text-ink-2")
                    }
                  >
                    {sinVersion ? "sin versión" : "no la tengo"}
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

          <div className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className={LABEL_CLASS}>Kilometraje</label>
              <input type="number" className={INPUT_CLASS} placeholder="Ej: 50000"
                value={km} onChange={(e) => setKm(e.target.value)} />
            </div>

            <button
              className="h-[42px] rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:hover:bg-blue-600"
              disabled={!anio || !km || cargando}
              onClick={generarChecklist}
            >
              {cargando ? "Generando…" : "Generar checklist"}
            </button>
          </div>
        </section>

        {/* Qué revisar en esta marca */}
        {marca && ref && (
          <section className={`${CARD} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <div className={EYEBROW}>
                <IcoRadar className="h-3.5 w-3.5" />
                Qué revisar en esta marca · {marca}
              </div>
              <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
                Referencia externa
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-[11px] font-medium text-ink-3">Modelo(s) más problemático(s)</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ref.modelos.map((m) => (
                    <span key={m} className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-ink-2">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-ink-3">Falla más representativa</div>
                <div className="mt-1.5 text-sm text-ink">{ref.falla}</div>
              </div>
            </div>
          </section>
        )}

        {resultado && resultado.error && (
          <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-2 shadow-card">
            {resultado.error}
          </div>
        )}

        {resultado && !resultado.error && (
          <section className="space-y-5">
            <div className={EYEBROW}>
              <IcoClipboard className="h-3.5 w-3.5" />
              Análisis del vehículo
            </div>

            {/* Inspección Diferenciada */}
            {resultado.inspeccionDiferenciada && (() => {
              const d = resultado.inspeccionDiferenciada;
              const alerta = d.superaUmbral === true;
              return (
                <div
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 ${
                    alerta ? "border-amber-200 bg-amber-50" : "border-blue-100 bg-blue-50"
                  }`}
                >
                  {alerta ? (
                    <IcoAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  ) : (
                    <IcoInfo className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-ink">
                      {alerta
                        ? "Requiere inspección diferenciada"
                        : d.superaUmbral === false
                        ? "Modelo con protocolo de inspección diferenciada"
                        : "Este modelo puede requerir inspección diferenciada"}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-2">
                      Umbral {d.umbralKm.toLocaleString("es-CL")} km
                      {d.superaUmbral === true && " · el vehículo lo supera"}
                      {d.superaUmbral === false && " · el vehículo ingresado no lo supera"}
                      {d.superaUmbral === null && " · ingresá el kilometraje para confirmar si aplica"}
                    </div>
                    {d.link && (
                      <a
                        href={d.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
                      >
                        Ver protocolo <IcoExternal className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* IQI */}
              <div className={`${CARD} p-4`}>
                <div className={MINI_LABEL}>IQI · Marca · Año · KM</div>
                <div className="mt-1.5 flex items-end gap-2">
                  <span className={`font-display text-[44px] font-bold leading-none ${GRADE_TEXT[resultado.iqi.grado] ?? "text-ink"}`}>
                    {resultado.iqi.grado}
                  </span>
                  <span className="pb-1 text-xs text-ink-3">puntaje {resultado.iqi.puntaje}</span>
                </div>
                <div className="mt-3 flex gap-1">
                  {["A", "B", "C", "D", "E"].map((g) => (
                    <span
                      key={g}
                      className={`h-1.5 flex-1 rounded-full ${
                        g === resultado.iqi.grado ? GRADE_BG[g] : "bg-line"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-ink-2">
                  <span className="rounded border border-line bg-paper px-1.5 py-0.5">Año {resultado.iqi.buckets.anio}</span>
                  <span className="rounded border border-line bg-paper px-1.5 py-0.5">KM {resultado.iqi.buckets.km ?? "—"}</span>
                  <span className="rounded border border-line bg-paper px-1.5 py-0.5">Marca {resultado.iqi.buckets.marca}</span>
                </div>
                {resultado.iqi.parcial && (
                  <div className="mt-2 text-[11px] text-ink-3">Sin KM: calculado con 2 factores</div>
                )}
                {resultado.iqi.marcaConGrado === false && (
                  <div className="mt-2 text-[11px] text-ink-3">Marca sin grado IQI: se asumió C</div>
                )}
              </div>

              {/* Tasa cangrejo · modelo */}
              <div className={`${CARD} p-4`}>
                <div className={MINI_LABEL}>Tasa de cangrejo · modelo</div>
                <div className="mt-1.5 font-display text-[44px] font-bold leading-none tabular-nums text-ink">
                  {resultado.cangrejo.tasa.tasaMm != null ? `${resultado.cangrejo.tasa.tasaMm}%` : "—"}
                </div>
                <div className="mt-2 text-xs text-ink-3">
                  {resultado.cangrejo.tasa.cangrejosMm} de {resultado.cangrejo.tasa.autosMm} {marca} {modelo}
                </div>
                <div className="text-[11px] text-ink-3">todos los años</div>
              </div>

              {/* Riesgo cangrejo · marca (score) */}
              <div className={`${CARD} p-4`}>
                <div className={MINI_LABEL}>Riesgo de cangrejo · marca</div>
                <div className="mt-1.5 flex items-end gap-1.5">
                  <span className="font-display text-[44px] font-bold leading-none tabular-nums text-ink">
                    {resultado.cangrejo.tasaMarca.score != null
                      ? resultado.cangrejo.tasaMarca.score.toFixed(2)
                      : "—"}
                  </span>
                  <span className="pb-1.5 text-xs text-ink-3">/ 1</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${Math.round((resultado.cangrejo.tasaMarca.score ?? 0) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-ink-3">
                  tasa{" "}
                  {resultado.cangrejo.tasaMarca.tasaMm != null ? `${resultado.cangrejo.tasaMarca.tasaMm}%` : "—"}{" "}
                  ({resultado.cangrejo.tasaMarca.cangrejosMm} en {resultado.cangrejo.tasaMarca.autosMm} {marca})
                </div>
              </div>
            </div>

            {/* Protocolo */}
            {protocolo && (
              <div className={`${CARD} overflow-hidden`}>
                {/* Pestañas: Normal (KJI por IQI) / Híbrido (VH eléctrico-híbrido) */}
                <div className="flex border-b border-line bg-paper">
                  {(["normal", "hibrido"] as const).map((t) => {
                    const activo = tabProtocolo === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTabProtocolo(t)}
                        className={`-mb-px border-b-2 px-5 py-3 text-[13px] font-medium transition ${
                          activo
                            ? "border-neutral-900 text-neutral-900"
                            : "border-transparent text-ink-3 hover:text-ink-2"
                        }`}
                      >
                        {t === "normal" ? `Normal · IQI ${protocolo.grado}` : "Híbrido / Eléctrico"}
                      </button>
                    );
                  })}
                </div>

                {tabProtocolo === "normal" ? (
                  <>
                    <div className="bg-neutral-900 px-5 py-4 text-white">
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-white/50">
                        Protocolo de inspección · IQI {protocolo.grado}
                      </div>
                      <div className="mt-0.5 font-display text-[15px] font-semibold">
                        {protocolo.codigo} · {protocolo.nombre} · {protocolo.rev}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center">
                      <div className="px-3 py-3">
                        <div className={MINI_LABEL}>Tiempo objetivo</div>
                        <div className="mt-0.5 font-display text-[15px] font-semibold tabular-nums text-ink">
                          {protocolo.tiempoObjetivoMin}–{protocolo.tiempoObjetivoMax} min
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        <div className={MINI_LABEL}>Riesgo</div>
                        <div className="mt-0.5 font-display text-[15px] font-semibold text-ink">
                          {protocolo.riesgo}
                        </div>
                      </div>
                      <div className="px-3 py-3">
                        <div className={MINI_LABEL}>Etapas</div>
                        <div className="mt-0.5 font-display text-[15px] font-semibold tabular-nums text-ink">
                          {protocolo.etapas.length}
                        </div>
                      </div>
                    </div>

                    <ol className="divide-y divide-line">
                      {protocolo.etapas.map((e) => (
                        <li key={e.n} className="flex gap-3.5 px-5 py-4">
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-900 font-display text-[11px] font-semibold tabular-nums text-white">
                            {e.n}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-display text-[13.5px] font-semibold text-ink">{e.etapa}</div>
                            <div className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{e.secuencia}</div>
                            <div className="mt-2 grid gap-x-4 gap-y-1 text-[11.5px] text-ink-3 sm:grid-cols-2">
                              <div><span className="font-medium text-ink-2">Evidencia: </span>{e.evidencia}</div>
                              <div><span className="font-medium text-ink-2">Escalamiento: </span>{e.escalamiento}</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <>
                    <div className="bg-neutral-900 px-5 py-4 text-white">
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-white/50">
                        Protocolo híbrido / eléctrico · fijo (no depende del IQI)
                      </div>
                      <div className="mt-0.5 font-display text-[15px] font-semibold">
                        {PROTOCOLO_HIBRIDO.codigo} · {PROTOCOLO_HIBRIDO.nombre} · {PROTOCOLO_HIBRIDO.rev}
                      </div>
                    </div>

                    <div className="border-b border-line px-5 py-2 text-[11px] text-ink-3">
                      Deméritos: {PROTOCOLO_HIBRIDO.escalaDemeritos}
                    </div>

                    <ol className="divide-y divide-line">
                      {PROTOCOLO_HIBRIDO.etapas.map((e) => (
                        <li key={e.n} className="flex gap-3.5 px-5 py-4">
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-900 font-display text-[11px] font-semibold tabular-nums text-white">
                            {e.n}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                              {e.grupo}
                            </div>
                            <div className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{e.secuencia}</div>
                            {e.link && (
                              <div className="mt-1 text-[11px] text-ink-3">{e.link}</div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            )}

            {/* Datos históricos analizados */}
            <div className={`${CARD} p-5 sm:p-6`}>
              <div className={EYEBROW}>
                <IcoChart className="h-3.5 w-3.5" />
                Datos históricos analizados
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-line bg-paper p-4 text-center">
                  <div className="font-display text-[26px] font-bold tabular-nums text-ink">
                    {resultado.stats.devoluciones}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-3">Devoluciones</div>
                  <div className="mt-0.5 text-[11px] text-ink-3">
                    {marca} {modelo}
                    {resultado.stats.pctDevoluciones != null
                      ? ` · ${resultado.stats.pctDevoluciones}% del modelo`
                      : ""}
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-paper p-4 text-center">
                  <div className="font-display text-[26px] font-bold tabular-nums text-ink">
                    {resultado.stats.cangrejos}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-3">Cangrejos</div>
                  <div className="mt-0.5 text-[11px] text-ink-3">
                    {marca} {modelo} · de {resultado.cangrejo.tasa.autosMm} autos
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-paper p-4 text-center">
                  <div className="font-display text-[26px] font-bold tabular-nums text-blue-600">
                    {resultado.stats.autosDelGrupo}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-3">
                    {marca} {modelo} · todos los años
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-3">
                    {resultado.stats.totalTiposOts} fallas distintas · {resultado.stats.otsPorAuto} OTs/auto
                  </div>
                </div>
              </div>

              {resultado.stats.otsTop10?.length > 0 && (
                <div className="mt-4 rounded-lg border border-line bg-paper p-4">
                  <div className="text-xs font-semibold text-ink-2">Fallas más frecuentes del modelo</div>
                  <ul className="mt-3 space-y-3">
                    {resultado.stats.otsTop10.map(
                      (o: { item: string; autos: number; count: number; pct: number | null }) => (
                        <li key={o.item}>
                          <div className="flex items-baseline justify-between gap-3 text-xs">
                            <span className="truncate text-ink-2">{o.item}</span>
                            <span className="shrink-0 font-semibold tabular-nums text-blue-700">
                              {o.pct != null ? `${o.pct}%` : "—"}
                              <span className="font-normal text-ink-3">
                                {" "}({o.autos}/{resultado.stats.autosDelGrupo})
                              </span>
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
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
    </div>
  );
}

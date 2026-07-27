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
    setModelo(""); setVersion(""); setAnio("");
    try {
      const valores = await fetchOpciones({ marca: v });
      setOpciones((o) => ({ ...o, modelo: valores, version: [], anio: [] }));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }

  async function onChangeModelo(v: string) {
    setModelo(v);
    setVersion(""); setAnio("");
    try {
      const valores = await fetchOpciones({ marca, modelo: v });
      setOpciones((o) => ({ ...o, version: valores, anio: [] }));
      setError(null);
    } catch (e: any) { setError(e.message); }
  }

  async function onChangeVersion(v: string) {
    setVersion(v);
    setAnio("");
    try {
      const valores = await fetchOpciones({ marca, modelo, version: v });
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
          marca, modelo, version, anio: Number(anio),
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
          <label className="block text-sm mb-1">Versión</label>
          <select className="border rounded w-full p-2" value={version} disabled={!modelo}
            onChange={(e) => onChangeVersion(e.target.value)}>
            <option value="">Selecciona...</option>
            {opciones.version.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Año</label>
          <select className="border rounded w-full p-2" value={anio} disabled={!version}
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

      {resultado && (
        <section className="border rounded-lg p-6 mt-6 space-y-3">
          <h2 className="font-semibold">Resultado</h2>
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}

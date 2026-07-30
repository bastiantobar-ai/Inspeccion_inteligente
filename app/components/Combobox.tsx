"use client";

/**
 * Combobox: input con autocompletado y lista desplegable propia.
 *
 * Reemplaza al <datalist> nativo, cuyo desplegable lo dibuja el
 * navegador y no admite estilos (ni scroll propio, ni resaltado,
 * ni estado vacío).
 *
 * A diferencia del <input list>, acá onChange se dispara solo al
 * elegir una opción válida — no en cada tecla. Eso evita disparar
 * la cascada de fetch (marca → modelo → versión → año) con valores
 * a medio escribir.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  label: ReactNode;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function Combobox({
  label,
  value,
  options,
  onChange,
  onFocus,
  disabled = false,
  placeholder = "Escribe o selecciona...",
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState(value);
  const [tecleando, setTecleando] = useState(false);
  const [resaltado, setResaltado] = useState(0);
  const cajaRef = useRef<HTMLDivElement | null>(null);
  const listaRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => { setTexto(value); }, [value]);

  // Mientras no se teclee se muestra la lista completa; al teclear, filtra.
  const filtradas = tecleando
    ? options.filter((o) => o.toLowerCase().includes(texto.trim().toLowerCase()))
    : options;

  function cerrarYResolver() {
    // Si lo tecleado calza exacto con una opción se acepta igual,
    // aunque no se haya hecho click en la lista. Si no, se revierte.
    const exacta = options.find((o) => o.toLowerCase() === texto.trim().toLowerCase());
    if (exacta) {
      if (exacta !== value) onChange(exacta);
      setTexto(exacta);
    } else {
      setTexto(value);
    }
    setAbierto(false);
    setTecleando(false);
  }

  // Cerrar al hacer click fuera. Se usa mousedown (no onBlur) porque
  // onBlur dispara antes del click y se comería la selección.
  useEffect(() => {
    if (!abierto) return;
    function onDocMouseDown(e: MouseEvent) {
      if (cajaRef.current && !cajaRef.current.contains(e.target as Node)) cerrarYResolver();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  });

  // Mantener visible la opción resaltada al navegar con flechas.
  useEffect(() => {
    if (!abierto || !listaRef.current) return;
    // .item() devuelve Element | null (indexar devuelve Element a secas,
    // y afirmarlo como HTMLElement | undefined no compila).
    listaRef.current.children.item(resaltado)?.scrollIntoView({ block: "nearest" });
  }, [resaltado, abierto]);

  function elegir(v: string) {
    onChange(v);
    setTexto(v);
    setAbierto(false);
    setTecleando(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!abierto) { setAbierto(true); setResaltado(0); return; }
      setResaltado((r) => Math.min(r + 1, filtradas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((r) => Math.max(r - 1, 0));
    } else if (e.key === "Enter") {
      const op = filtradas[resaltado];
      if (abierto && op) { e.preventDefault(); elegir(op); }
    } else if (e.key === "Escape") {
      setTexto(value);
      setAbierto(false);
      setTecleando(false);
    }
  }

  return (
    <div ref={cajaRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={abierto}
          autoComplete="off"
          className={
            "w-full rounded-lg border bg-white px-3 py-2.5 pr-9 text-sm shadow-sm transition " +
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 " +
            "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed " +
            (abierto ? "border-blue-500" : "border-gray-200")
          }
          value={texto}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => {
            if (disabled) return;
            setAbierto(true);
            setTecleando(false);
            setResaltado(0);
            onFocus?.();
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            setTecleando(true);
            setAbierto(true);
            setResaltado(0);
          }}
          onKeyDown={onKeyDown}
        />
        <svg
          className={
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-transform " +
            (disabled ? "text-gray-300 " : "text-gray-400 ") +
            (abierto ? "rotate-180" : "")
          }
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {abierto && !disabled && (
        <ul
          ref={listaRef}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-gray-200/60"
        >
          {filtradas.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-gray-400">Sin resultados</li>
          )}
          {filtradas.map((op, i) => {
            const esValor = op === value;
            return (
              <li
                key={op}
                role="option"
                aria-selected={esValor}
                onMouseEnter={() => setResaltado(i)}
                onClick={() => elegir(op)}
                className={
                  "flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors " +
                  (i === resaltado ? "bg-blue-50 " : "") +
                  (esValor ? "font-medium text-blue-700" : "text-gray-700")
                }
              >
                <span className="truncate">{op}</span>
                {esValor && <span className="ml-2 shrink-0 text-blue-600">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

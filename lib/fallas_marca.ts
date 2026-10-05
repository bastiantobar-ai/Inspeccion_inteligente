/**
 * Referencia por MARCA: modelo(s) más problemático(s) y falla más
 * representativa. NO sale de la base de KAVAK — es una recopilación
 * de reliability surveys / foros / recalls públicos (investigación
 * web, sept. 2026). Sirve como contexto para el inspector, no como
 * dato duro. Revisar/actualizar cada tanto.
 *
 * Las claves están normalizadas (mayúsculas, sin acentos). El lookup
 * (`fallasPorMarca`) normaliza la marca que entra.
 */

export type RefFallasMarca = {
  /** 1-3 modelos o generaciones con peor reputación. */
  modelos: string[];
  /** La falla que más se comenta para esa marca. */
  falla: string;
  /** true si es patrón inferido de la marca, sin data del modelo puntual. */
  inferido?: boolean;
};

const DATA: Record<string, RefFallasMarca> = {
  // ── Japonesas ──
  TOYOTA: {
    modelos: ["Hilux diésel GD-6 (2016-2019)", "Camry / RAV4 2.4 2AZ-FE (2007-2011)"],
    falla: "DPF tapado + inyectores (diésel GD) · 2AZ: consumo de aceite",
  },
  LEXUS: {
    modelos: ["IS / ES / RX (2007-2012, motores 2AZ/2GR)"],
    falla: "Tablero pegajoso/derretido + consumo de aceite",
  },
  HONDA: {
    modelos: ["CR-V y Civic 1.5 turbo (2017-2019)"],
    falla: "Dilución de aceite con combustible",
  },
  NISSAN: {
    modelos: ["Altima / Sentra / Versa con CVT Jatco (2013+)"],
    falla: "Falla de CVT (sobrecalentamiento, shudder)",
  },
  INFINITI: {
    modelos: ["QX60 / JX35 (2013+)"],
    falla: "Falla de CVT (misma Jatco)",
    inferido: true,
  },
  MAZDA: {
    modelos: ["CX-7 2.3 turbo (2007-2012)"],
    falla: "Estiramiento de cadena de distribución + turbo",
  },
  SUBARU: {
    modelos: [
      "Outback / Forester / Legacy EJ25 (2000-2011)",
      "Forester / Impreza / XV FB25 (2011-2014)",
    ],
    falla: "Junta de culata (EJ25) · consumo de aceite (FB25)",
  },
  SUZUKI: {
    modelos: ["Vitara / SX4 / Kizashi con CVT", "SX4 1.6"],
    falla: "Falla de CVT · cadena de distribución (1.6)",
  },
  MITSUBISHI: {
    modelos: ["Outlander / ASX / Lancer 2014-2017 con CVT"],
    falla: "Falla de CVT + demora en la aceleración (recall)",
  },
  DAIHATSU: {
    modelos: ["Terios / Sirion / Materia"],
    falla: "Ruido de cadena de distribución + óxido",
    inferido: true,
  },

  // ── Coreanas ──
  HYUNDAI: {
    modelos: ["Sonata / Tucson / Santa Fe 2011-2019 (Theta II GDI)"],
    falla: "Falla de motor (biela/rodamiento) por defecto de cigüeñal",
  },
  KIA: {
    modelos: [
      "Optima / Sorento / Sportage 2011-2019 (Theta II)",
      "Forte / Soul con DCT de 7 vel.",
    ],
    falla: "Falla de motor · shudder/tirones del DCT",
  },
  SSANGYONG: {
    modelos: ["Rexton / Korando / Actyon diésel 2.0-2.2"],
    falla: "Turbo + inyectores (fuga a aceite), 100-150k km",
  },
  SAMSUNG: {
    modelos: ["SM3 / SM5 / QM6"],
    falla: "CVT + fallas eléctricas",
    inferido: true,
  },

  // ── Resto ──
  MG: {
    modelos: ["MG ZS / MG 3"],
    falla: "Fallas eléctricas y de software + CVT con tirones",
  },
  VOLKSWAGEN: {
    modelos: ["Golf / Jetta / Polo 1.4 TSI (2013-2018)"],
    falla: "Estiramiento de cadena de distribución + judder del DSG DQ200",
  },
  SEAT: {
    modelos: ["Ibiza / León / Ateca 1.5 TSI + DSG"],
    falla: "Cadena de distribución TSI + judder del DSG",
    inferido: true,
  },
  SKODA: {
    modelos: ["Octavia / Fabia / Karoq 1.5 TSI + DSG"],
    falla: "Cadena de distribución TSI + judder del DSG",
    inferido: true,
  },
  CUPRA: {
    modelos: ["León / Formentor 2.0 TSI + DSG7"],
    falla: "Mecatrónica del DSG + consumo de aceite",
    inferido: true,
  },
  AUDI: {
    modelos: ["A4 / A5 / Q5 2.0 TFSI EA888 Gen1 (2009-2012)"],
    falla: "Consumo de aceite (anillos) + tensor de cadena",
  },
  BMW: {
    modelos: ["X1 / 320i / 328i / 118i con N20/N26 (2011-2015)"],
    falla: "Falla de cadena de distribución (guías plásticas); N47 diésel igual",
  },
  MINI: {
    modelos: ["Cooper S R56 con N14 (2007-2010)"],
    falla: '"Death rattle" de cadena de distribución + turbo por falta de lubricación',
  },
  "MERCEDES BENZ": {
    modelos: ["Modelos con OM651 diésel (2009-2015)", "M272 / M273 nafta"],
    falla: "Inyectores piezo + cadena estirada · eje balanceador",
  },
  FORD: {
    modelos: ["Focus / Fiesta (2011-2016)"],
    falla: "Transmisión PowerShift: shudder, deslizamiento, limp mode",
  },
  CHEVROLET: {
    modelos: ["Onix / Prisma / Sail", "Cruze 1.4T"],
    falla: "Consumo excesivo de aceite + fugas",
  },
  RENAULT: {
    modelos: ["Duster / Clio / Symbol / Sandero (1.6 K4M o 1.3 TCe)"],
    falla: "Consumo de aceite con pérdida de potencia → falla de motor (65-125k km)",
  },
  PEUGEOT: {
    modelos: ["208 / 2008 / 308 / 3008 con 1.2 PureTech (2013+)"],
    falla: 'Correa de distribución "húmeda" que se desintegra + consumo de aceite',
  },
  CITROEN: {
    modelos: ["C3 / C4 / Berlingo con 1.2 PureTech (2013+)"],
    falla: 'Correa de distribución "húmeda" que se desintegra + caja automática con tirones',
  },
  OPEL: {
    modelos: ["Corsa / Mokka / Crossland con 1.2 PureTech (2020+)", "1.4 Turbo (cadena)"],
    falla: "Correa/cadena de distribución + inmovilizador impide arranque",
  },
  DS: {
    modelos: ["DS3 / DS4 / DS7 con 1.2 PureTech"],
    falla: 'Correa de distribución "húmeda" + caja EAT con tirones',
    inferido: true,
  },
  JEEP: {
    modelos: ["Compass 1ª gen (2007-2016)", "Renegade pre-2019"],
    falla: "Falla de motor + brazos de suspensión · consumo de aceite + caja 9 vel.",
  },
  FIAT: {
    modelos: ["500 / 500L / 500X (2012-2016)", "Línea Firefly (Argo/Cronos/Pulse)"],
    falla: "Fallas eléctricas · diafragma de tapa de válvulas roto → quema aceite",
  },
  DODGE: {
    modelos: ["Journey / Caliber", "RAM 1500 (módulo TIPM)"],
    falla: "Frenos + CVT (Caliber) · fallas eléctricas / calado (TIPM)",
  },
  RAM: {
    modelos: ["RAM 1500 (módulo TIPM)"],
    falla: "Fallas eléctricas / calado + cambios duros de transmisión",
  },
  VOLVO: {
    modelos: ["XC60 / S60 / V40 (2010-2018)"],
    falla: "Fallas eléctricas (batería/sensores/cableado) + turbo en alto km",
  },
  "LAND ROVER": {
    modelos: ["Range Rover / Sport / Evoque"],
    falla: "Suspensión neumática (fugas, compresor) + fallas eléctricas",
  },
  JAGUAR: {
    modelos: ["XE / XF / F-Pace con 2.0d Ingenium (2015+)"],
    falla: "Cadena de distribución + dilución de aceite; gremlins eléctricos",
  },
  PORSCHE: {
    modelos: ["Cayenne / Macan (V6)"],
    falla: "Cañerías de refrigerante + (Cayenne) caja de transferencia; suspensión neumática",
  },
  "ALFA ROMEO": {
    modelos: ["Giulietta / MiTo con TCT (doble embrague)"],
    falla: "Falla de embrague/mecatrónica; 1.4 MultiAir → actuador",
  },
  CHERY: {
    modelos: ["Gen vieja (Tiggo / QQ / Fulwin)", "Tiggo 7 / 8 Pro"],
    falla: "Fallas eléctricas · lógica de ADAS/software agresiva",
  },
  GEELY: {
    modelos: ["Emgrand / Coolray"],
    falla: "DCT (tirones, fugas de aceite) + turbo",
  },
  HAVAL: {
    modelos: ["H6 · Jolion"],
    falla: "Transmisión DCT + consumo de combustible alto + electrónica",
  },
  GWM: {
    modelos: ["Pickups Wingle / Poer", "H-series viejas"],
    falla: "DPF tapado + dilución de diésel en aceite + repuestos escasos",
  },
  "GREAT WALL": {
    modelos: ["Wingle / Poer", "H-series viejas"],
    falla: "DPF tapado + dilución de diésel en aceite + repuestos escasos",
  },
  CHANGAN: {
    modelos: ["CS35 / Alsvin"],
    falla: "DCT de 5 vel. con tirones + hesitación/pérdida de potencia",
  },
  JAC: {
    modelos: ["S2 / S3"],
    falla: "Fallas eléctricas intermitentes + DCT con lag + óxido",
  },
  TESLA: {
    modelos: ["Model 3 / Model Y (primeros años)"],
    falla: "Calidad de armado (paneles/ruidos) + brazos/rótulas de suspensión + 12V",
  },
  BYD: {
    modelos: ["(data escasa)"],
    falla: "Batería 12V (drenaje) + software/infotainment",
    inferido: true,
  },
  MAHINDRA: {
    modelos: ["Pik-Up / Scorpio diésel"],
    falla: "Inyectores/turbo + eléctrica + óxido",
    inferido: true,
  },
  BRILLIANCE: {
    modelos: ["V5 / H320 / H330"],
    falla: "Seguridad estructural + calidad de armado + eléctrica",
    inferido: true,
  },
  OMODA: {
    modelos: ["(plataforma Chery)"],
    falla: "ADAS/software agresivo + infotainment",
    inferido: true,
  },
  JAECOO: {
    modelos: ["(plataforma Chery)"],
    falla: "ADAS/software agresivo + infotainment",
    inferido: true,
  },
  JETOUR: {
    modelos: ["X70 (plataforma Chery)"],
    falla: "Caja: 1ª no engrana / salto de marcha + vibración; ADAS/software",
    inferido: true,
  },
  EXEED: {
    modelos: ["(plataforma Chery premium)"],
    falla: "ADAS/software agresivo + infotainment",
    inferido: true,
  },
};

// Marcas chinas de bajo volumen sin data pública confiable: mismo patrón.
const PATRON_CHINA_BAJO_VOLUMEN: RefFallasMarca = {
  modelos: ["Sin data pública confiable"],
  falla:
    "Patrón de marca china de bajo volumen: glitches de infotainment/eléctrica + DCT/CVT con tirones a baja velocidad + repuestos escasos + óxido temprano",
  inferido: true,
};
for (const marca of [
  "DFSK", "FOTON", "JMC", "DONGFENG", "DFM", "BAIC", "GAC", "KAIYI", "FAW",
  "ZX AUTO", "LIFAN", "SWM", "LIVAN", "MAPLE", "ZNA", "UAZ", "KYC", "JIM",
  "RIDDARA", "LYNC & CO", "LEAPMOTOR",
]) {
  DATA[marca] = PATRON_CHINA_BAJO_VOLUMEN;
}

function norm(s: string): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos
    .toUpperCase()
    .trim();
}

/** Devuelve la referencia de fallas para la marca, o null si no hay. */
export function fallasPorMarca(marca: string | null | undefined): RefFallasMarca | null {
  if (!marca) return null;
  return DATA[norm(marca)] ?? null;
}

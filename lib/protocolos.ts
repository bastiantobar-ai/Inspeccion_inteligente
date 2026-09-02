/**
 * Protocolos de inspección KAVAK · Supply Inspection (REV 01), uno por
 * grado de IQI FINAL (A-E). Cada grado define un tiempo objetivo, un
 * nivel de riesgo y la secuencia de etapas a ejecutar.
 *
 * Fuente: hojas "KJI · CQI {A..E}" del ERP. Acá el grado se rotula
 * como IQI para ser consistente con lib/iqi.ts.
 *
 * Transcripción manual de las hojas — si en la hoja se corrige una
 * etapa, hay que actualizarla también acá.
 */

export type Grado = "A" | "B" | "C" | "D" | "E";

export type EtapaProtocolo = {
  n: number;
  etapa: string;
  secuencia: string;
  evidencia: string;
  escalamiento: string;
};

export type Protocolo = {
  grado: Grado;
  codigo: string; // "KJI · IQI A"
  nombre: string; // "Inspección Liviana"
  rev: string; // "REV 01"
  riesgo: string; // "Bajo"
  tiempoObjetivoMin: number; // minutos
  tiempoObjetivoMax: number; // minutos
  aplicaA: string;
  etapas: EtapaProtocolo[];
};

const A: Protocolo = {
  grado: "A",
  codigo: "KJI · IQI A",
  nombre: "Inspección Liviana",
  rev: "REV 01",
  riesgo: "Bajo",
  tiempoObjetivoMin: 15,
  tiempoObjetivoMax: 25,
  aplicaA:
    "Vehículos recientes, bajo kilometraje, marca/confiabilidad favorable y sin alertas relevantes.",
  etapas: [
    {
      n: 1,
      etapa: "Recepción y datos críticos",
      secuencia:
        "Validar cliente, patente, agenda, OPP, versión cotizada y kilometraje real.",
      evidencia: "Patente, odómetro y documentos si aplica.",
      escalamiento: "Si versión/km no coincide, activar recotización.",
    },
    {
      n: 2,
      etapa: "Documentación y trazabilidad",
      secuencia:
        "Revisar padrón, documentos disponibles, VIN visible y coherencia con sistema.",
      evidencia: "Foto documento/VIN cuando aplique.",
      escalamiento:
        "Inconsistencia legal, motor cambiado o datos no trazables = escalar/rechazar según STD.",
    },
    {
      n: 3,
      etapa: "Scanner básico",
      secuencia:
        "Realizar ODO check, lectura VIN y revisión de DTC activos o almacenados.",
      evidencia: "Foto/captura de scanner.",
      escalamiento:
        "DTC activo en motor, transmisión, ABS, airbag o dirección = escalar.",
    },
    {
      n: 4,
      etapa: "Motor estático",
      secuencia:
        "Validar arranque, ralentí, humo visible, niveles, fugas evidentes, ruidos y soportes evidentes.",
      evidencia: "Foto/video si hay ruido, fuga o humo.",
      escalamiento:
        "Humo azul/blanco persistente, golpeteo o fuga crítica = escalar/rechazar.",
    },
    {
      n: 5,
      etapa: "Prueba dinámica corta",
      secuencia:
        "Validar avance, retroceso, frenos, dirección, suspensión y transmisión dentro del HUB.",
      evidencia: "Comentario en FlowBuilder si hay síntoma.",
      escalamiento:
        "Golpes, retardo, patinamiento o vibración fuerte = escalar.",
    },
    {
      n: 6,
      etapa: "Funcionales básicos",
      secuencia:
        "Probar luces, limpiaparabrisas, jet lanzaaguas, claxon, cierre centralizado, llaves y comandos principales.",
      evidencia: "Foto/video si hay falla.",
      escalamiento: "Falla funcional relevante = demeritar o escalar.",
    },
    {
      n: 7,
      etapa: "Interior y exterior 360",
      secuencia:
        "Revisar interior, tapiz, tablero, cristales, ópticos, carrocería, pintura y daños visibles.",
      evidencia: "Fotos de daños y set requerido.",
      escalamiento: "Daño estructural sospechoso = escalar de inmediato.",
    },
    {
      n: 8,
      etapa: "Neumáticos y frenos visibles",
      secuencia:
        "Medir profundidad de neumáticos, revisar desgaste irregular, llantas y estado visible de frenos.",
      evidencia: "Foto de medición si está bajo STD.",
      escalamiento:
        "Neumático roto, alambres visibles o freno crítico = demeritar/rechazar según STD.",
    },
    {
      n: 9,
      etapa: "A/C e infoentretenimiento",
      secuencia:
        "Validar aire acondicionado, calefacción, pantalla, audio, sensores/cámara si equipa.",
      evidencia: "Foto/video si falla.",
      escalamiento: "Falla de A/C, pantalla o cámara relevante = demeritar.",
    },
    {
      n: 10,
      etapa: "Deméritos y evidencia",
      secuencia: "Registrar deméritos correctos, con monto y evidencia suficiente.",
      evidencia: "Evidencia asociada a cada hallazgo.",
      escalamiento: "No cerrar sin evidencia coherente.",
    },
    {
      n: 11,
      etapa: "Cierre FlowBuilder/Slack",
      secuencia:
        "Confirmar datos, evidencia, resultado y cierre en hilo si corresponde.",
      evidencia: "FlowBuilder enviado y cierre trazable.",
      escalamiento:
        "Datos incorrectos o recotización pendiente = no enviar tarea mecánica.",
    },
  ],
};

const B: Protocolo = {
  grado: "B",
  codigo: "KJI · IQI B",
  nombre: "Inspección Estándar Extendida",
  rev: "REV 01",
  riesgo: "Bajo-medio",
  tiempoObjetivoMin: 25,
  tiempoObjetivoMax: 35,
  aplicaA:
    "Vehículos con riesgo moderado, kilometraje medio bajo o primera señal de profundización por marca/equipamiento.",
  etapas: [
    {
      n: 1,
      etapa: "Recepción y comprobación de versión",
      secuencia:
        "Validar OPP, patente, versión real, kilometraje, documentos y coherencia con FlowBuilder.",
      evidencia: "Patente, odómetro, documento/VIN si aplica.",
      escalamiento:
        "Diferencia de versión/km = solicitar recotización antes de enviar tarea.",
    },
    {
      n: 2,
      etapa: "Scanner ampliado",
      secuencia: "Revisar DTC, VIN, ODO, ECM, TCM, ABS, SRS y BCM si aplica.",
      evidencia: "Captura de scanner y códigos.",
      escalamiento: "DTC crítico o testigo encendido = escalar.",
    },
    {
      n: 3,
      etapa: "Datos en vivo básicos",
      secuencia:
        "Validar datos en vivo de motor/transmisión cuando exista duda: temperatura, RPM, carga, sensores relevantes.",
      evidencia: "Captura si hay lectura anómala.",
      escalamiento: "Lecturas fuera de rango = escalar a KJI C.",
    },
    {
      n: 4,
      etapa: "Motor y bahía",
      secuencia:
        "Revisar fluidos, fugas, batería/conexiones, filtros, sistema de enfriamiento, correa y accesorios.",
      evidencia: "Fotos de fugas, correa, batería o fluidos.",
      escalamiento:
        "Fuga, correa dañada, batería defectuosa o enfriamiento alterado = demeritar/escalar.",
    },
    {
      n: 5,
      etapa: "Prueba dinámica estándar",
      secuencia:
        "Evaluar caja, frenos, dirección, suspensión, soportes, vibraciones, ruido y respuesta bajo carga moderada.",
      evidencia: "Video/comentario si hay síntoma.",
      escalamiento:
        "Golpes de caja, soporte roto, ruido fuerte o freno deficiente = escalar.",
    },
    {
      n: 6,
      etapa: "Funcionales extendidos",
      secuencia:
        "Revisar llaves, cierre, inmovilizador, botoneras, conmutadores, volante, claxon, tablero, cluster, infoentretenimiento y sensores.",
      evidencia: "Foto/video de falla.",
      escalamiento:
        "Falla eléctrica repetitiva o módulo sin respuesta = escalar.",
    },
    {
      n: 7,
      etapa: "A/C y confort",
      secuencia:
        "Medir temperatura A/C si corresponde, revisar soplador, calefacción, compuertas y desempañador.",
      evidencia: "Foto termómetro si falla.",
      escalamiento: "A/C fuera de STD = demeritar.",
    },
    {
      n: 8,
      etapa: "Exterior/carrocería 360",
      secuencia:
        "Revisar frontal, laterales, parte trasera, parabrisas, ópticos, pintura y reparaciones visibles.",
      evidencia: "Fotos claras de daño.",
      escalamiento: "Sospecha estructural = escalar a KJI C/D.",
    },
    {
      n: 9,
      etapa: "Levantamiento seguro",
      secuencia:
        "Levantar con gata/banquillo y revisar mecánica delantera y trasera visible.",
      evidencia: "Evidencia de levante/hallazgo si aplica.",
      escalamiento: "Holguras, fugas o daños inferiores = demeritar/escalar.",
    },
    {
      n: 10,
      etapa: "Suspensión, frenos y neumáticos",
      secuencia:
        "Medir neumáticos, revisar llantas, rines, suspensión delantera/trasera, frenos, dirección y escape visible.",
      evidencia: "Fotos de mediciones y hallazgos.",
      escalamiento:
        "Bajo estándar o daño crítico = demeritar/rechazar según STD.",
    },
    {
      n: 11,
      etapa: "Repuestos y faltantes",
      secuencia:
        "Revisar rueda repuesto, gata, llave, dado seguridad, kit y elementos exigidos.",
      evidencia: "Foto de faltante o estado.",
      escalamiento: "Faltantes deben quedar demeritados.",
    },
    {
      n: 12,
      etapa: "Control de deméritos",
      secuencia:
        "Validar monto, categoría, evidencia y coherencia de cada hallazgo.",
      evidencia: "FlowBuilder completo.",
      escalamiento: "No cerrar con hallazgos sin respaldo.",
    },
    {
      n: 13,
      etapa: "Devolución y cierre",
      secuencia: "Informar resultado, próximos pasos y cerrar Slack/FlowBuilder.",
      evidencia: "Cierre trazable.",
      escalamiento:
        "No prometer valorización si hay recotización o validación pendiente.",
    },
  ],
};

const C: Protocolo = {
  grado: "C",
  codigo: "KJI · IQI C",
  nombre: "Inspección Técnica Media",
  rev: "REV 01",
  riesgo: "Medio",
  tiempoObjetivoMin: 35,
  tiempoObjetivoMax: 45,
  aplicaA:
    "Vehículos con mayor kilometraje, mayor antigüedad, dudas técnicas, síntomas o familia con falla probable.",
  etapas: [
    {
      n: 1,
      etapa: "Validación integral inicial",
      secuencia:
        "Confirmar OPP, versión, km, documentos, VIN, historial, alertas, Sensei/campañas y consistencia con FlowBuilder.",
      evidencia: "Odómetro, VIN/documentos y nota de validación.",
      escalamiento:
        "Diferencia crítica = recotización o escalamiento antes de cerrar.",
    },
    {
      n: 2,
      etapa: "Scanner completo + interpretación",
      secuencia:
        "Escanear módulos críticos, revisar DTC activos/históricos, ODO check, datos en vivo y freeze frame si disponible.",
      evidencia: "Capturas de DTC y módulos.",
      escalamiento:
        "DTC en motor/caja/SRS/ABS/dirección = análisis y escalamiento.",
    },
    {
      n: 3,
      etapa: "Pruebas activas cuando aplique",
      secuencia:
        "Realizar accionamientos con scanner para electroventilador, actuadores, A/C, cuerpos o sistemas con duda.",
      evidencia: "Captura/video de prueba.",
      escalamiento: "Falla de accionamiento = demeritar/escalar.",
    },
    {
      n: 4,
      etapa: "Motor técnico preventivo",
      secuencia:
        "Revisar fugas, humo, ralentí, vibraciones, soportes, correas, enfriamiento, admisión, PCV/cuerpo aceleración si aplica.",
      evidencia: "Fotos/video de síntomas.",
      escalamiento:
        "Humo anómalo, fuga activa, temperatura anómala o soporte roto = escalar.",
    },
    {
      n: 5,
      etapa: "Mantención y fluidos",
      secuencia:
        "Validar evidencia de mantención, aceite, refrigerante, filtros, estado de fluidos y vencimiento por km/fecha.",
      evidencia: "Foto comprobante/varilla/niveles.",
      escalamiento: "Sin evidencia o mantención vencida = demeritar según STD.",
    },
    {
      n: 6,
      etapa: "Transmisión y tren motriz",
      secuencia:
        "Prueba de cambios, carga, R/D, embrague si MT, retardo, patinamiento, ruido, soportes y fugas visibles.",
      evidencia: "Video/comentario técnico.",
      escalamiento: "Síntoma de caja/embrague = escalar a KJI D.",
    },
    {
      n: 7,
      etapa: "Prueba dinámica técnica",
      secuencia:
        "Probar frenos, dirección, suspensión, ruidos en baches, vibración, alineación perceptible y comportamiento en maniobra.",
      evidencia: "Video si hay ruido o vibración.",
      escalamiento:
        "Ruido fuerte, holgura o dirección/freno anómalo = demeritar/escalar.",
    },
    {
      n: 8,
      etapa: "Estructura y carrocería reforzada",
      secuencia:
        "Revisar frontal, puntas, marco radiador, torres, costados, piso maleta, tina repuesto, sellos y reparaciones.",
      evidencia: "Fotos de zonas estructurales si hay sospecha.",
      escalamiento: "Daño estructural = rechazo o validación TMS según STD.",
    },
    {
      n: 9,
      etapa: "Eléctrico/confort extendido",
      secuencia:
        "Revisar cluster, infoentretenimiento, parktronic, cámaras, A/C, asientos eléctricos, keyless, ventanas y espejos.",
      evidencia: "Foto/video de falla.",
      escalamiento: "Falla de módulo o sistema crítico = demeritar/escalar.",
    },
    {
      n: 10,
      etapa: "Neumáticos, frenos y suspensión completa",
      secuencia:
        "Medir neumáticos, revisar pastillas/discos, mangueras, freno estacionamiento, amortiguadores, rótulas, bieletas, bujes y homocinéticas.",
      evidencia: "Fotos de medición/hallazgo.",
      escalamiento: "Desgaste fuera de STD o rotura = demeritar/rechazar.",
    },
    {
      n: 11,
      etapa: "Escape y emisiones visibles",
      secuencia:
        "Revisar estado estructural, soportes, fugas, catalizador/sensores visibles y manipulación.",
      evidencia: "Fotos si hay fuga/manipulación.",
      escalamiento: "Catalizador manipulado o fuga importante = escalar.",
    },
    {
      n: 12,
      etapa: "Coherencia diagnóstico-demérito",
      secuencia:
        "Verificar que síntoma, evidencia, scanner y demérito cuenten la misma historia.",
      evidencia: "Deméritos con evidencia.",
      escalamiento: "Incoherencia = no cerrar hasta corregir.",
    },
    {
      n: 13,
      etapa: "Cierre técnico",
      secuencia:
        "Registrar conclusión, feedback si corresponde y cierre trazable.",
      evidencia: "FlowBuilder + Slack.",
      escalamiento: "Duda técnica no resuelta = escalar a TMS/TT&DJ.",
    },
  ],
};

const D: Protocolo = {
  grado: "D",
  codigo: "KJI · IQI D",
  nombre: "Inspección Crítica",
  rev: "REV 01",
  riesgo: "Alto",
  tiempoObjetivoMin: 45,
  tiempoObjetivoMax: 60,
  aplicaA:
    "Vehículos de alto riesgo por IQI, alto kilometraje, antigüedad, síntomas, historial, familia sensible o alerta de producto.",
  etapas: [
    {
      n: 1,
      etapa: "Pre-check de riesgo",
      secuencia:
        "Revisar IQI, alertas, historial, blacklist, Sensei, campañas, versión, km, OPP y antecedentes comerciales.",
      evidencia: "Resumen de riesgo en observación.",
      escalamiento: "Alerta crítica o antecedente grave = considerar KJI E.",
    },
    {
      n: 2,
      etapa: "Scanner full crítico",
      secuencia:
        "Escanear todos los módulos disponibles, datos en vivo, pruebas activas y sistemas de seguridad/confort críticos.",
      evidencia: "Capturas por módulo relevante.",
      escalamiento:
        "Módulo sin comunicación o DTC activo crítico = escalar/rechazar según STD.",
    },
    {
      n: 3,
      etapa: "Motor crítico",
      secuencia:
        "Evaluar arranque, ralentí, humo, gaseo, temperatura, fugas, golpeteo, soportes, admisión, enfriamiento, PCV, VVT, inyectores/EGR/EVAP si aplica.",
      evidencia: "Video de motor y evidencia de falla.",
      escalamiento:
        "Golpeteo, humo, fuga activa o sobretemperatura = rechazo/escalamiento.",
    },
    {
      n: 4,
      etapa: "Pruebas estáticas de motor",
      secuencia:
        "Aceleración en vacío, respuesta, cortes, ruidos metálicos, vibración y comportamiento de soportes.",
      evidencia: "Video si hay síntoma.",
      escalamiento: "Cualquier síntoma severo debe quedar trazado y escalado.",
    },
    {
      n: 5,
      etapa: "Transmisión crítica",
      secuencia:
        "Probar R/D, cambios bajo carga, retardo, patinamiento, golpe, embrague MT, transfer/diferencial si aplica y fugas.",
      evidencia: "Video/comentario técnico.",
      escalamiento:
        "Falla de caja, clutch, transfer o diferencial = escalar/rechazar.",
    },
    {
      n: 6,
      etapa: "Prueba dinámica extendida",
      secuencia:
        "Evaluar en condiciones controladas frenos, dirección, suspensión, baches, giro, carga, vibración y ruidos.",
      evidencia: "Video de ruido/síntoma.",
      escalamiento:
        "Ruidos fuertes, holguras o vibración severa = demeritar/escalar.",
    },
    {
      n: 7,
      etapa: "Estructura crítica",
      secuencia:
        "Revisar puntos de chasis, almas, marco radiador, torres, zócalos, piso, tina repuesto, largueros y sellos.",
      evidencia: "Fotos por zona revisada si hay sospecha.",
      escalamiento: "Daño estructural relevante = rechazo.",
    },
    {
      n: 8,
      etapa: "Mecánica inferior completa",
      secuencia:
        "Revisar fugas, tren delantero/trasero, amortiguadores, bujes, rótulas, bieletas, homocinéticas, frenos, dirección y escape.",
      evidencia: "Evidencia de cada hallazgo.",
      escalamiento: "Roturas, fugas o holguras críticas = escalar/rechazar.",
    },
    {
      n: 9,
      etapa: "A/C, electricidad y módulos",
      secuencia:
        "Revisar compresor, presión/carga si disponible, soplador, cluster, sensores, cámaras, parktronic, keyless y sistemas eléctricos.",
      evidencia: "Foto/video de falla y scanner si aplica.",
      escalamiento: "Falla de módulo crítico = escalar.",
    },
    {
      n: 10,
      etapa: "Neumáticos/frenos críticos",
      secuencia:
        "Medir neumáticos, pastillas, discos, freno de mano/eléctrico, mangueras y condición de seguridad.",
      evidencia: "Fotos de medición.",
      escalamiento:
        "Componente de seguridad fuera de STD = demeritar/rechazar según criterio.",
    },
    {
      n: 11,
      etapa: "Escape/emisiones",
      secuencia:
        "Revisar fugas, catalizador, sensores O2, manipulación, soportes y ruidos.",
      evidencia: "Fotos de sistema.",
      escalamiento:
        "Catalizador ausente/manipulado o fuga grave = rechazo/escalamiento.",
    },
    {
      n: 12,
      etapa: "Validación de costos/riesgo cangrejo",
      secuencia:
        "Evaluar si los hallazgos podrían superar estándar de reparación o generar pérdida.",
      evidencia: "Resumen técnico-comercial.",
      escalamiento: "Costo/tiempo fuera de estándar = escalar antes de aprobar.",
    },
    {
      n: 13,
      etapa: "Validación TMS/TT&DJ",
      secuencia: "Solicitar validación técnica cuando exista duda crítica.",
      evidencia: "Hilo con evidencia y decisión.",
      escalamiento: "No aprobar sin validación si hay riesgo alto.",
    },
    {
      n: 14,
      etapa: "Cierre con control final FTQ",
      secuencia:
        "Revisar que no queden omisiones de motor, caja, estructura, scanner, neumáticos, frenos, batería o evidencia.",
      evidencia: "Checklist final completo.",
      escalamiento: "Sin control final no se cierra la inspección.",
    },
  ],
};

const E: Protocolo = {
  grado: "E",
  codigo: "KJI · IQI E",
  nombre: "Diferenciada Full / Blacklist",
  rev: "REV 01",
  riesgo: "Muy alto",
  tiempoObjetivoMin: 60,
  tiempoObjetivoMax: 120,
  aplicaA:
    "Vehículos blacklist, historial de pérdidas/cangrejos, alertas de producto, alto riesgo comercial, síntomas severos o familias sensibles.",
  etapas: [
    {
      n: 1,
      etapa: "Bloqueo inicial de riesgo",
      secuencia:
        "Revisar IQI E, blacklist, alertas, historial de fallas, pérdidas, devoluciones, cangrejos, campañas y antecedentes del VIN/patente.",
      evidencia: "Resumen de antecedentes.",
      escalamiento: "Antecedente incompatible con STD = rechazo.",
    },
    {
      n: 2,
      etapa: "Validación documental avanzada",
      secuencia:
        "Validar patente, VIN, motor, documentos, Autofact si aplica, versión, km, número motor y coherencia completa.",
      evidencia: "Fotos/capturas de respaldo.",
      escalamiento:
        "Cambio de motor = rechazo obligatorio, aunque esté documentado.",
    },
    {
      n: 3,
      etapa: "Scanner full + módulos críticos",
      secuencia:
        "Escanear todos los módulos, revisar comunicación, DTC, datos en vivo, pruebas activas, calibraciones y actualizaciones si aplica.",
      evidencia: "Capturas de módulos y códigos.",
      escalamiento:
        "DTC activo o módulo crítico sin comunicación = escalar/rechazar.",
    },
    {
      n: 4,
      etapa: "ADAS, cámaras y keyless",
      secuencia:
        "Validar sensores, cámaras, parktronic, radar, ADAS, keyless, antenas, botón start/stop y calibraciones cuando equipe.",
      evidencia: "Foto/video/prueba funcional.",
      escalamiento: "Falla ADAS o calibración pendiente = demeritar.",
    },
    {
      n: 5,
      etapa: "Eléctrico/humedad/conectores",
      secuencia:
        "Revisar cluster, BCM, conectores, sellos eléctricos, módulos airbag, conectores amarillos, humedad, sulfatación y reparaciones visibles.",
      evidencia: "Fotos detalladas.",
      escalamiento:
        "Humedad o intervención eléctrica crítica = rechazo/escalamiento.",
    },
    {
      n: 6,
      etapa: "Motor full",
      secuencia:
        "Evaluar arranque frío/caliente, ralentí, humo, gaseo, compresión/síntomas, temperatura, fugas, soporte, distribución, VVT, PCV, inyectores, EGR/EVAP según marca.",
      evidencia: "Video + fotos + scanner.",
      escalamiento:
        "Golpeteo, humo severo, fuga crítica o sobrecalentamiento = rechazo.",
    },
    {
      n: 7,
      etapa: "Transmisión full",
      secuencia:
        "Probar AT/CVT/DCT/MT, R/D, carga, pendiente si aplica, clutch, transfer, diferencial, golpes, patinamiento, retardo y fugas.",
      evidencia: "Video de prueba.",
      escalamiento:
        "Síntoma relevante de caja/transfer/diferencial = rechazo o validación alta.",
    },
    {
      n: 8,
      etapa: "Prueba dinámica extendida controlada",
      secuencia:
        "Ejecutar prueba dinámica más completa: frenado, aceleración, baches, giros, vibración, ruidos, dirección y estabilidad.",
      evidencia: "Video de hallazgos.",
      escalamiento: "Cualquier síntoma de seguridad = rechazo/escalamiento.",
    },
    {
      n: 9,
      etapa: "Estructura full",
      secuencia:
        "Revisar frontal, puntas, almas, marco radiador, torres, zócalos, piso, tina repuesto, largueros, sellos y soldaduras.",
      evidencia: "Evidencia por zona sospechosa.",
      escalamiento: "Daño estructural o reparación crítica = rechazo.",
    },
    {
      n: 10,
      etapa: "Mecánica inferior full",
      secuencia:
        "Levante y revisión completa de tren delantero/trasero, fugas, palieres, homocinéticas, bujes, rótulas, amortiguadores, frenos, dirección y escape.",
      evidencia: "Fotos de cada punto crítico.",
      escalamiento: "Rotura/fuga/holgura crítica = rechazo/escalamiento.",
    },
    {
      n: 11,
      etapa: "Mantenimiento y trazabilidad",
      secuencia:
        "Validar mantención, kilometraje, desgaste interior, ODO check, coherencia con motor/caja y documentación.",
      evidencia: "Evidencia de mantención o ausencia.",
      escalamiento:
        "Sin trazabilidad suficiente en vehículo crítico = escalar.",
    },
    {
      n: 12,
      etapa: "Costo y decisión comercial",
      secuencia:
        "Evaluar si la reparación excede estándar de costo/tiempo o genera riesgo de cangrejo.",
      evidencia: "Resumen de costos/riesgo.",
      escalamiento: "Riesgo de cangrejo = rechazo o validación de liderazgo.",
    },
    {
      n: 13,
      etapa: "Validación obligatoria",
      secuencia:
        "Compartir evidencia con TMS / TT&DJ / Onboarding Comercial antes de aprobar si existe riesgo crítico.",
      evidencia: "Hilo con decisión final.",
      escalamiento: "Sin validación, no aprobar.",
    },
    {
      n: 14,
      etapa: "Cierre reforzado",
      secuencia:
        "Cerrar FlowBuilder, Slack, evidencia, deméritos, motivo de rechazo/aprobación y conclusión técnica clara.",
      evidencia: "Cierre completo y trazable.",
      escalamiento: "Cierre incompleto = no finalizar.",
    },
    {
      n: 15,
      etapa: "Aprendizaje/retroalimentación",
      secuencia:
        "Si el caso genera hallazgo relevante, documentar aprendizaje para actualización de KJI/STD/alerta.",
      evidencia: "Registro de mejora continua.",
      escalamiento: "Caso repetitivo = alerta de calidad o ajuste de estándar.",
    },
  ],
};

export const PROTOCOLOS: Record<Grado, Protocolo> = { A, B, C, D, E };

/** Devuelve el protocolo del grado IQI; cae a 'C' si el grado es raro. */
export function protocoloPorIqi(grado: string | null | undefined): Protocolo {
  const g = (grado ?? "").toUpperCase().trim();
  return (PROTOCOLOS as Record<string, Protocolo>)[g] ?? PROTOCOLOS.C;
}

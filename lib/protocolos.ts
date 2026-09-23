/**
 * Protocolos de inspección KAVAK · Supply Inspection (REV 02), uno por
 * grado de IQI FINAL (A-E). Cada grado define un tiempo objetivo, un
 * nivel de riesgo y una lista de grupos de control (8 grupos fijos:
 * versiones/identificación, mecánica/dinámica, diagnóstico electrónico,
 * estructura, cerrajería, interior, estética exterior, control técnico
 * y cierre), cada uno con sus puntos de control (N.º "1.01", "1.02"...).
 *
 * Fuente: hojas "KJI - IQI {A..E}" del archivo
 * "KJI_IQI_A-E_8_Grupos_Rev02" (REV. 02). Acá el grado se rotula como
 * IQI para ser consistente con lib/iqi.ts.
 *
 * Transcripción automática desde el CSV exportado de cada hoja — si la
 * hoja se corrige, hay que re-exportar y regenerar acá.
 */

export type Grado = "A" | "B" | "C" | "D" | "E";

export type ItemControl = {
  n: string; // "1.01"
  /** Resumen del punto de control (columna "QUÉ REVISAR"). */
  queRevisar: string;
  /** Procedimiento completo (columna "CONTROL COMPLETO - REV. 02"). */
  controlCompleto: string;
  evidencia: string;
  escalamiento: string;
};

export type GrupoControl = {
  /** "1 | Versiones, identificación y documentación" */
  grupo: string;
  items: ItemControl[];
};

export type Protocolo = {
  grado: Grado;
  codigo: string; // "KJI · IQI A"
  nombre: string; // "Inspección Liviana"
  rev: string; // "REV 02"
  riesgo: string; // "Bajo"
  tiempoObjetivoMin: number; // minutos
  tiempoObjetivoMax: number; // minutos
  aplicaA: string;
  grupos: GrupoControl[];
};

const A: Protocolo = {
  grado: "A",
  codigo: "KJI · IQI A",
  nombre: "Inspección Liviana",
  rev: "REV 02",
  riesgo: "Bajo",
  tiempoObjetivoMin: 15,
  tiempoObjetivoMax: 25,
  aplicaA: "Vehículos recientes, bajo kilometraje, marca/confiabilidad favorable y sin alertas relevantes.",
  grupos: [
    {
      grupo: "1 | Versiones, identificación y documentación",
      items: [
        {
          n: "1.01",
          queRevisar: "Confirmar cliente, agenda y OPP; comparar ambas patentes con el registro y revisarlas físicamente. Si hay diferencias de identidad, escalar.",
          controlCompleto: "Confirmar cliente, agenda y OPP. Comparar la patente registrada con ambas placas y efectuar su comprobación física según KJI vigente.",
          evidencia: "Patente y registro del caso; fotos según STD.",
          escalamiento: "Diferencia de identidad: detener el cierre y escalar.",
        },
        {
          n: "1.02",
          queRevisar: "Comparar marca, modelo, año, motor, transmisión y equipamiento con la versión cotizada. Si difiere, solicitar recotización.",
          controlCompleto: "Validar marca, modelo, año, motorización, transmisión y equipamiento identificador frente a la versión cotizada.",
          evidencia: "Datos validados y evidencia del equipamiento.",
          escalamiento: "Diferencia de versión: solicitar recotización; no cerrar con datos antiguos.",
        },
        {
          n: "1.03",
          queRevisar: "Contrastar VIN, número de motor verificable y documentos. Cambio de motor: rechazo, aunque esté documentado. Evidenciar diferencias.",
          controlCompleto: "Contrastar VIN visible, número de motor verificable y documentos disponibles. Registrar cualquier inconsistencia o cambio de motor.",
          evidencia: "Fotos legibles de identificadores/documentos.",
          escalamiento: "Cambio de motor: rechazo incluso documentado. Duda de identidad: escalar.",
        },
        {
          n: "1.04",
          queRevisar: "Comparar odómetro con agenda, OPP y FlowBuilder. Registrar kilometraje real y foto; gestionar diferencias antes de enviar.",
          controlCompleto: "Comparar el odómetro con agenda, OPP y FlowBuilder. Registrar el kilometraje real y diferencias detectadas al inicio.",
          evidencia: "Foto de odómetro y dato de sistema.",
          escalamiento: "Gestionar diferencia de kilometraje; no enviar formulario desactualizado.",
        },
        {
          n: "1.05",
          queRevisar: "Solicitar respaldos de aceite/filtro, distribución si aplica y documentos exigidos. Registrar ausencias y aplicar STD vigente.",
          controlCompleto: "Solicitar comprobantes de aceite/filtro y distribución cuando aplique. Revisar documentación especial exigida en el flujo y registrar ausencias.",
          evidencia: "Comprobante o constancia de su ausencia.",
          escalamiento: "Aplicar el STD y demeritador vigentes; una ausencia no prueba por sí sola una falla.",
        },
        {
          n: "1.06",
          queRevisar: "Abrir FlowBuilder y revisar Inspección Inteligente, historial, alertas y campañas. Confirmar IQI; no asumir A si falta el dato.",
          controlCompleto: "Abrir FlowBuilder y revisar Inspección Inteligente, historial disponible, alertas y campañas aplicables. Confirmar el IQI recibido y datos del caso.",
          evidencia: "Referencia de IQI y consulta de alertas/campañas.",
          escalamiento: "Alerta o IQI no confirmado: consultar al responsable; no asumir nivel A.",
        },
      ],
    },
    {
      grupo: "2 | Mecánica y prueba dinámica",
      items: [
        {
          n: "2.01",
          queRevisar: "Observar arranque, ralentí, ruidos y vibraciones. Registrar condición; ante golpeteo relevante, suspender la prueba de riesgo y escalar.",
          controlCompleto: "Observar el arranque disponible, estabilidad de ralentí, ruidos y vibraciones. Registrar la condición observada sin forzar una falla.",
          evidencia: "Registro de condición; video si hay anomalía.",
          escalamiento: "Golpeteo o síntoma relevante: suspender prueba que agrave el riesgo y escalar.",
        },
        {
          n: "2.02",
          queRevisar: "Observar presencia y persistencia de humo por escape; grabar si existe. No asegurar causa interna sin respaldo; escalar según STD.",
          controlCompleto: "Observar el humo durante el funcionamiento permitido y describir su presencia y persistencia. No asignar una causa interna sin respaldo.",
          evidencia: "Video del humo si existe.",
          escalamiento: "Humo persistente o severo: aplicar criterio de escalamiento/rechazo del STD.",
        },
        {
          n: "2.03",
          queRevisar: "Revisar nivel y aspecto de aceite/refrigerante. No abrir circuitos calientes o presurizados. Evidenciar contaminación y escalar.",
          controlCompleto: "Revisar niveles y aspecto mediante puntos accesibles y método seguro. Registrar indicios de contaminación; no abrir circuitos calientes o presurizados.",
          evidencia: "Registro de niveles/estado; fotos de anomalía.",
          escalamiento: "Contaminación o condición no concluyente: escalar; no afirmar una causa no comprobada.",
        },
        {
          n: "2.04",
          queRevisar: "Revisar motor superior, fugas, sudoraciones y mangueras/conexiones visibles. Fotografiar ubicación; escalar fugas críticas o dudas.",
          controlCompleto: "Revisar vano motor y zonas accesibles: fugas, sudoraciones y estado visible de mangueras/conexiones. Describir ubicación y condición observada.",
          evidencia: "Foto general y detalle de cada hallazgo.",
          escalamiento: "Fuga crítica: escalar/rechazar según STD. Origen incierto: registrar diagnóstico pendiente.",
        },
        {
          n: "2.05",
          queRevisar: "Medir todos los neumáticos de rodado y registrar por rueda. Revisar desgaste, daños y llantas; contrastar con el STD.",
          controlCompleto: "Medir todos los neumáticos de rodado; revisar desgaste, daños y llantas. Registrar la ubicación de cada medición y contrastar con el STD vigente.",
          evidencia: "Medidas por rueda y fotos según STD.",
          escalamiento: "Fuera de STD: demeritar o escalar según gravedad; no omitir una rueda.",
        },
        {
          n: "2.06",
          queRevisar: "Revisar frenos delanteros/traseros y estacionamiento; registrar por eje. Ante condición crítica, no realizar prueba dinámica y escalar.",
          controlCompleto: "Revisar el estado visible y medible de frenos; comprobar estacionamiento según procedimiento. Dejar pendiente lo que no pueda verificarse.",
          evidencia: "Registro por eje; medición/foto cuando corresponda.",
          escalamiento: "Condición crítica: no ejecutar prueba dinámica; escalar según STD.",
        },
        {
          n: "2.07",
          queRevisar: "Con gata y banquillo, según método seguro, revisar fugas, tren delantero y dirección accesibles. Sin apoyo seguro, no levantar.",
          controlCompleto: "Preparar levante con gata y banquillo según KJI seguro. Revisar fugas inferiores, tren delantero, dirección y componentes accesibles.",
          evidencia: "Registro de revisión y fotos de hallazgos.",
          escalamiento: "Sin apoyo/condición segura: no levantar. Punto no verificable: PENDIENTE y escalar.",
        },
        {
          n: "2.08",
          queRevisar: "Con acceso seguro, revisar suspensión trasera, fugas y escape. Evidenciar hallazgos y completar la revisión antes de bajar el vehículo.",
          controlCompleto: "Con acceso seguro, revisar suspensión trasera, fugas y escape visible. Completar los controles inferiores aplicables antes de bajar el vehículo conforme al procedimiento.",
          evidencia: "Registro y fotos de cada hallazgo.",
          escalamiento: "Daño, fuga o holgura relevante: escalar/demeritar según STD.",
        },
        {
          n: "2.09",
          queRevisar: "Revisar rueda de repuesto, herramientas y dado/llave de seguridad. Fotografiar faltantes; guardar y asegurar. Acceso impedido no es OK.",
          controlCompleto: "Retirar y revisar el repuesto según el método del vehículo; comprobar herramientas y dado/llave de seguridad aplicables. Guardar y asegurar al finalizar.",
          evidencia: "Foto del repuesto/kit y faltantes.",
          escalamiento: "Faltante: demeritar según STD. Acceso impedido: registrar y gestionar, no asumir OK.",
        },
        {
          n: "2.10",
          queRevisar: "Con condiciones seguras, probar en HUB avance/reversa, cambios, frenos, dirección y suspensión. Ante síntomas, limitar y escalar.",
          controlCompleto: "Tras validar condiciones seguras, probar en HUB avance/reversa, cambios, respuesta de frenos, dirección y suspensión. Describir golpes, retardos o vibraciones.",
          evidencia: "Registro del recorrido y síntomas; evidencia segura.",
          escalamiento: "Síntoma relevante: detener/limitar la prueba y escalar; no provocar maniobras extremas.",
        },
      ],
    },
    {
      grupo: "3 | Diagnóstico electrónico y sistema eléctrico",
      items: [
        {
          n: "3.01",
          queRevisar: "Preparar motor/contacto según KJI; realizar ODO Check y leer VIN. Guardar captura y contrastar identidad. Sin acceso, PENDIENTE y escalar.",
          controlCompleto: "Apagar el motor y preparar contacto/alimentación según KJI y equipo. Realizar ODO Check y lectura de VIN disponibles; contrastar con datos del grupo 1.",
          evidencia: "Captura con identidad del vehículo y lectura ODO.",
          escalamiento: "Sin acceso o comunicación: PENDIENTE y escalar; no cerrar como escaneo realizado.",
        },
        {
          n: "3.02",
          queRevisar: "Leer motor, transmisión, ABS, airbag y dirección equipados/accesibles; registrar DTC y testigos. No borrar códigos; escalar hallazgos relevantes.",
          controlCompleto: "Leer los módulos críticos equipados y accesibles: motor, transmisión, ABS, airbag y dirección. Registrar DTC/estado y testigos; no borrar códigos.",
          evidencia: "Informe/capturas identificables y tablero.",
          escalamiento: "DTC/testigo relevante o módulo crítico no verificado: escalar antes del cierre.",
        },
        {
          n: "3.03",
          queRevisar: "Probar todas las luces exteriores/interiores equipadas. Registrar ubicación y evidencia de falla; evaluar daño físico de ópticos en grupo 7.",
          controlCompleto: "Realizar la prueba de luces equipadas y registrar ubicación de cualquier falla de funcionamiento. La condición física del óptico se registra en grupo 7.",
          evidencia: "Resultado de prueba; foto/video si falla.",
          escalamiento: "Aplicar demérito/validación según STD; no omitir luces por un IQI favorable.",
        },
        {
          n: "3.04",
          queRevisar: "Revisar batería y terminales; probar con equipo y procedimiento disponible. Registrar resultado; demeritar/escalar si no cumple o hay duda.",
          controlCompleto: "Revisar estado de batería y terminales; realizar la comprobación con el equipo disponible según procedimiento y registrar resultado.",
          evidencia: "Resultado de prueba y fotos de anomalía.",
          escalamiento: "Resultado fuera de STD o prueba no concluyente: demeritar/escalar.",
        },
      ],
    },
    {
      grupo: "4 | Estructura",
      items: [
        {
          n: "4.01",
          queRevisar: "Revisar estructura frontal visible; identificar deformaciones o reparaciones. Registrar zona/fotos; diferenciar estética y escalar sospechas.",
          controlCompleto: "Revisar frontal y sus elementos estructurales visibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.02",
          queRevisar: "Revisar estructura lateral copiloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral copiloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.03",
          queRevisar: "Revisar estructura posterior, piso y tina de repuesto accesibles. Registrar deformaciones/reparaciones con fotos y escalar sospechas.",
          controlCompleto: "Revisar zona posterior y piso/tina de repuesto accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.04",
          queRevisar: "Revisar estructura lateral piloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral piloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
      ],
    },
    {
      grupo: "5 | Cerrajería y aperturas",
      items: [
        {
          n: "5.01",
          queRevisar: "Probar aperturas/cierres de puertas, capot, maletero y tapa de combustible. Revisar ajuste y asegurar cierres antes de mover el vehículo.",
          controlCompleto: "Accionar aperturas y cierres equipados. Revisar ajuste y asegurar capot/maletero al finalizar; preparar el vehículo para la vuelta de cerrajería.",
          evidencia: "Registro de prueba; evidencia si hay falla.",
          escalamiento: "Apertura/cierre defectuoso: demeritar o escalar. No mover con cierre inseguro.",
        },
        {
          n: "5.02",
          queRevisar: "Probar cada llave disponible, mando y cierre centralizado. Registrar llave faltante o función defectuosa y aplicar STD.",
          controlCompleto: "Probar las llaves disponibles, funciones de mando y cierre centralizado. Registrar la llave faltante o la función que no responde.",
          evidencia: "Registro por llave; foto/video de falla.",
          escalamiento: "Faltante o falla: registrar el demérito según STD; duda de funcionamiento: escalar.",
        },
      ],
    },
    {
      grupo: "6 | Interior y funcionamiento",
      items: [
        {
          n: "6.01",
          queRevisar: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y seguridad accesible. Cruzar desgaste con km/escáner; evidenciar y escalar dudas.",
          controlCompleto: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y elementos de seguridad accesibles. Contrastar desgaste con kilometraje y datos del escáner.",
          evidencia: "Fotos de daño y registro de coherencia.",
          escalamiento: "Duda de desgaste/identidad o seguridad: documentar y escalar sin asumir la causa.",
        },
        {
          n: "6.02",
          queRevisar: "Probar limpiaparabrisas, plumillas, lanzaaguas y claxon. Identificar la función afectada; registrar evidencia y demérito según STD.",
          controlCompleto: "Probar comando y accionamiento de plumillas, jet lanzaaguas y claxon. Registrar la función afectada si hay desvío.",
          evidencia: "Resultado; foto/video si hay falla.",
          escalamiento: "Falla funcional: demeritar según STD y describirla sin generalizar.",
        },
        {
          n: "6.03",
          queRevisar: "Probar A/C y calefacción; medir con termómetro según método vigente. Registrar temperatura y condiciones; escalar resultados no concluyentes.",
          controlCompleto: "Comprobar funcionamiento y registrar temperatura con termómetro según método vigente. Indicar condiciones de la prueba.",
          evidencia: "Lectura del termómetro y registro funcional.",
          escalamiento: "Fuera de STD o prueba no concluyente: demeritar/escalar según corresponda.",
        },
        {
          n: "6.04",
          queRevisar: "Probar pantalla, audio y cámara/sensores de estacionamiento si equipa. Registrar función y síntoma; no equivale a validar ADAS.",
          controlCompleto: "Probar pantalla/audio y la función de cámara/sensores de estacionamiento cuando equipe. Registrar componente y síntoma observado.",
          evidencia: "Resultado; foto/video si falla.",
          escalamiento: "Falla: demeritar/escalar según STD. No confundir esta prueba con validación ADAS.",
        },
      ],
    },
    {
      grupo: "7 | Estética exterior y repuestos exteriores",
      items: [
        {
          n: "7.01",
          queRevisar: "Recorrer exterior; revisar chapa, pintura y reparaciones. Fotografiar por panel/ubicación. Sospecha estructural: volver al grupo 4 y escalar.",
          controlCompleto: "Recorrer el exterior y revisar daños de chapa/pintura y reparaciones visibles. Documentar panel y ubicación; ampliar si aparece sospecha.",
          evidencia: "Fotos por panel con hallazgo; set según STD.",
          escalamiento: "Daño estético: demeritar. Sospecha estructural: volver a grupo 4 y escalar.",
        },
        {
          n: "7.02",
          queRevisar: "Revisar cristales, ópticos, espejos y piezas exteriores. Fotografiar roturas, reparaciones y faltantes; aplicar STD para reparar/reemplazar.",
          controlCompleto: "Revisar condición física de cristales, ópticos, espejos y piezas exteriores. Identificar roturas, reparaciones y faltantes por ubicación.",
          evidencia: "Foto del componente y detalle del daño.",
          escalamiento: "Aplicar STD para reparar/reemplazar. La prueba de iluminación queda en grupo 3.",
        },
      ],
    },
    {
      grupo: "8 | Control técnico y cierre",
      items: [
        {
          n: "8.01",
          queRevisar: "Validar descripción, categoría, ubicación, evidencia y monto interno de cada hallazgo. Evitar duplicados; NO OK no siempre implica demérito.",
          controlCompleto: "Verificar hallazgo, descripción, categoría, ubicación y monto en el demeritador vigente. Evitar duplicados y corregir inconsistencias antes del envío.",
          evidencia: "Demérito y evidencia asociados.",
          escalamiento: "NO OK no equivale siempre a demérito: diferenciar recotización, validación o rechazo.",
        },
        {
          n: "8.02",
          queRevisar: "Revisar los ocho grupos, limitaciones y validaciones. Registrar conclusión según STD; IQI o porcentaje no aprueban por sí solos.",
          controlCompleto: "Revisar los ocho grupos, límites de inspección y validaciones pendientes. Registrar si la unidad puede continuar según STD; el IQI no aprueba por sí solo.",
          evidencia: "Conclusión técnica y decisión registrada.",
          escalamiento: "Duda crítica o criterio de rechazo: escalar/aplicar STD; no forzar aprobación.",
        },
        {
          n: "8.03",
          queRevisar: "Subir evidencia identificable cuanto antes; conciliar datos/deméritos y cerrar FlowBuilder/Slack. No finalizar con información pendiente.",
          controlCompleto: "Cargar evidencia identificable lo antes posible; comprobar coherencia con deméritos y datos actualizados. Enviar FlowBuilder y cerrar el hilo según flujo.",
          evidencia: "Enlace/registro de evidencia y cierre.",
          escalamiento: "Datos, evidencia o recotización pendientes: no finalizar con información incompleta.",
        },
        {
          n: "8.04",
          queRevisar: "Estacionar; explicar resultado, estado y deméritos según STD. Resolver dudas e indicar espera. No dar valores: oferta a cargo de Onboarder Supply.",
          controlCompleto: "Estacionar en zona indicada. Explicar resultado, estado general y deméritos según STD; resolver dudas y orientar la espera. La oferta la presenta Onboarder Supply.",
          evidencia: "Resultado comunicado y continuidad registrada.",
          escalamiento: "No informar valores al cliente ni prometer oferta. Duda técnica: aclarar antes de derivar.",
        },
      ],
    },
  ],
};

const B: Protocolo = {
  grado: "B",
  codigo: "KJI · IQI B",
  nombre: "Inspección Estándar Extendida",
  rev: "REV 02",
  riesgo: "Bajo-medio",
  tiempoObjetivoMin: 25,
  tiempoObjetivoMax: 35,
  aplicaA: "Vehículos con riesgo moderado, kilometraje medio bajo o primera señal de profundización por marca/equipamiento.",
  grupos: [
    {
      grupo: "1 | Versiones, identificación y documentación",
      items: [
        {
          n: "1.01",
          queRevisar: "Confirmar cliente, agenda y OPP; comparar ambas patentes con el registro y revisarlas físicamente. Si hay diferencias de identidad, escalar.",
          controlCompleto: "Confirmar cliente, agenda y OPP. Comparar la patente registrada con ambas placas y efectuar su comprobación física según KJI vigente.",
          evidencia: "Patente y registro del caso; fotos según STD.",
          escalamiento: "Diferencia de identidad: detener el cierre y escalar.",
        },
        {
          n: "1.02",
          queRevisar: "Comparar marca, modelo, año, motor, transmisión y equipamiento con la versión cotizada. Si difiere, solicitar recotización.",
          controlCompleto: "Validar marca, modelo, año, motorización, transmisión y equipamiento identificador frente a la versión cotizada.",
          evidencia: "Datos validados y evidencia del equipamiento.",
          escalamiento: "Diferencia de versión: solicitar recotización; no cerrar con datos antiguos.",
        },
        {
          n: "1.03",
          queRevisar: "Contrastar equipamiento diferenciador con una referencia técnica/documental de la versión. Validar diferencias antes del cierre.",
          controlCompleto: "Además de validar datos, contrastar el equipamiento diferenciador con una referencia documental/técnica de la versión correspondiente.",
          evidencia: "Referencia consultada y equipamiento contrastado.",
          escalamiento: "Referencia insuficiente o diferencia: validación de versión antes de cerrar.",
        },
        {
          n: "1.04",
          queRevisar: "Contrastar VIN, número de motor verificable y documentos. Cambio de motor: rechazo, aunque esté documentado. Evidenciar diferencias.",
          controlCompleto: "Contrastar VIN visible, número de motor verificable y documentos disponibles. Registrar cualquier inconsistencia o cambio de motor.",
          evidencia: "Fotos legibles de identificadores/documentos.",
          escalamiento: "Cambio de motor: rechazo incluso documentado. Duda de identidad: escalar.",
        },
        {
          n: "1.05",
          queRevisar: "Comparar odómetro con agenda, OPP y FlowBuilder. Registrar kilometraje real y foto; gestionar diferencias antes de enviar.",
          controlCompleto: "Comparar el odómetro con agenda, OPP y FlowBuilder. Registrar el kilometraje real y diferencias detectadas al inicio.",
          evidencia: "Foto de odómetro y dato de sistema.",
          escalamiento: "Gestionar diferencia de kilometraje; no enviar formulario desactualizado.",
        },
        {
          n: "1.06",
          queRevisar: "Solicitar respaldos de aceite/filtro, distribución si aplica y documentos exigidos. Registrar ausencias y aplicar STD vigente.",
          controlCompleto: "Solicitar comprobantes de aceite/filtro y distribución cuando aplique. Revisar documentación especial exigida en el flujo y registrar ausencias.",
          evidencia: "Comprobante o constancia de su ausencia.",
          escalamiento: "Aplicar el STD y demeritador vigentes; una ausencia no prueba por sí sola una falla.",
        },
        {
          n: "1.07",
          queRevisar: "Abrir FlowBuilder y revisar Inspección Inteligente, historial, alertas y campañas. Confirmar IQI; no asumir A si falta el dato.",
          controlCompleto: "Abrir FlowBuilder y revisar Inspección Inteligente, historial disponible, alertas y campañas aplicables. Confirmar el IQI recibido y datos del caso.",
          evidencia: "Referencia de IQI y consulta de alertas/campañas.",
          escalamiento: "Alerta o IQI no confirmado: consultar al responsable; no asumir nivel A.",
        },
      ],
    },
    {
      grupo: "2 | Mecánica y prueba dinámica",
      items: [
        {
          n: "2.01",
          queRevisar: "Observar arranque, ralentí, ruidos y vibraciones. Registrar condición; ante golpeteo relevante, suspender la prueba de riesgo y escalar.",
          controlCompleto: "Observar el arranque disponible, estabilidad de ralentí, ruidos y vibraciones. Registrar la condición observada sin forzar una falla.",
          evidencia: "Registro de condición; video si hay anomalía.",
          escalamiento: "Golpeteo o síntoma relevante: suspender prueba que agrave el riesgo y escalar.",
        },
        {
          n: "2.02",
          queRevisar: "Observar presencia y persistencia de humo por escape; grabar si existe. No asegurar causa interna sin respaldo; escalar según STD.",
          controlCompleto: "Observar el humo durante el funcionamiento permitido y describir su presencia y persistencia. No asignar una causa interna sin respaldo.",
          evidencia: "Video del humo si existe.",
          escalamiento: "Humo persistente o severo: aplicar criterio de escalamiento/rechazo del STD.",
        },
        {
          n: "2.03",
          queRevisar: "Revisar nivel y aspecto de aceite/refrigerante. No abrir circuitos calientes o presurizados. Evidenciar contaminación y escalar.",
          controlCompleto: "Revisar niveles y aspecto mediante puntos accesibles y método seguro. Registrar indicios de contaminación; no abrir circuitos calientes o presurizados.",
          evidencia: "Registro de niveles/estado; fotos de anomalía.",
          escalamiento: "Contaminación o condición no concluyente: escalar; no afirmar una causa no comprobada.",
        },
        {
          n: "2.04",
          queRevisar: "Revisar motor superior, fugas, sudoraciones y mangueras/conexiones visibles. Fotografiar ubicación; escalar fugas críticas o dudas.",
          controlCompleto: "Revisar vano motor y zonas accesibles: fugas, sudoraciones y estado visible de mangueras/conexiones. Describir ubicación y condición observada.",
          evidencia: "Foto general y detalle de cada hallazgo.",
          escalamiento: "Fuga crítica: escalar/rechazar según STD. Origen incierto: registrar diagnóstico pendiente.",
        },
        {
          n: "2.05",
          queRevisar: "Revisar correas, filtros y accesorios accesibles sin retirar piezas. Diferenciar desgaste de falta de respaldo de mantención; evidenciar.",
          controlCompleto: "Revisar condiciones visibles de correas, filtros accesibles y accesorios del motor, sin retirar componentes. Diferenciar desgaste observado de mantenimiento sin respaldo.",
          evidencia: "Fotos de componente/condición.",
          escalamiento: "Daño o anomalía: aplicar STD y escalar cuando requiera diagnóstico.",
        },
        {
          n: "2.06",
          queRevisar: "Ampliar revisión de depósito, mangueras y conexiones; cruzar niveles, residuos y fugas. No abrir el circuito presurizado; escalar anomalías.",
          controlCompleto: "Ampliar la inspección visual a depósito, mangueras y conexiones accesibles; relacionar nivel, residuos y fugas observadas sin abrir el circuito presurizado.",
          evidencia: "Fotos por zona y condiciones de revisión.",
          escalamiento: "Anomalía de enfriamiento o contaminación: escalar sin asegurar causa interna.",
        },
        {
          n: "2.07",
          queRevisar: "Revisar soportes accesibles y relacionar vibraciones con ralentí y dinámica ya probados. Registrar cuándo aparece el síntoma.",
          controlCompleto: "Observar soportes accesibles y relacionar vibraciones con las condiciones ya probadas de ralentí y dinámica. Describir cuándo aparece el síntoma.",
          evidencia: "Video/nota de condición si hay síntoma.",
          escalamiento: "Soporte dañado o vibración relevante: demeritar/escalar según STD.",
        },
        {
          n: "2.08",
          queRevisar: "Medir todos los neumáticos de rodado y registrar por rueda. Revisar desgaste, daños y llantas; contrastar con el STD.",
          controlCompleto: "Medir todos los neumáticos de rodado; revisar desgaste, daños y llantas. Registrar la ubicación de cada medición y contrastar con el STD vigente.",
          evidencia: "Medidas por rueda y fotos según STD.",
          escalamiento: "Fuera de STD: demeritar o escalar según gravedad; no omitir una rueda.",
        },
        {
          n: "2.09",
          queRevisar: "Revisar frenos delanteros/traseros y estacionamiento; registrar por eje. Ante condición crítica, no realizar prueba dinámica y escalar.",
          controlCompleto: "Revisar el estado visible y medible de frenos; comprobar estacionamiento según procedimiento. Dejar pendiente lo que no pueda verificarse.",
          evidencia: "Registro por eje; medición/foto cuando corresponda.",
          escalamiento: "Condición crítica: no ejecutar prueba dinámica; escalar según STD.",
        },
        {
          n: "2.10",
          queRevisar: "Con gata y banquillo, según método seguro, revisar fugas, tren delantero y dirección accesibles. Sin apoyo seguro, no levantar.",
          controlCompleto: "Preparar levante con gata y banquillo según KJI seguro. Revisar fugas inferiores, tren delantero, dirección y componentes accesibles.",
          evidencia: "Registro de revisión y fotos de hallazgos.",
          escalamiento: "Sin apoyo/condición segura: no levantar. Punto no verificable: PENDIENTE y escalar.",
        },
        {
          n: "2.11",
          queRevisar: "Con acceso seguro, revisar suspensión trasera, fugas y escape. Evidenciar hallazgos y completar la revisión antes de bajar el vehículo.",
          controlCompleto: "Con acceso seguro, revisar suspensión trasera, fugas y escape visible. Completar los controles inferiores aplicables antes de bajar el vehículo conforme al procedimiento.",
          evidencia: "Registro y fotos de cada hallazgo.",
          escalamiento: "Daño, fuga o holgura relevante: escalar/demeritar según STD.",
        },
        {
          n: "2.12",
          queRevisar: "Revisar rueda de repuesto, herramientas y dado/llave de seguridad. Fotografiar faltantes; guardar y asegurar. Acceso impedido no es OK.",
          controlCompleto: "Retirar y revisar el repuesto según el método del vehículo; comprobar herramientas y dado/llave de seguridad aplicables. Guardar y asegurar al finalizar.",
          evidencia: "Foto del repuesto/kit y faltantes.",
          escalamiento: "Faltante: demeritar según STD. Acceso impedido: registrar y gestionar, no asumir OK.",
        },
        {
          n: "2.13",
          queRevisar: "Con condiciones seguras, probar en HUB avance/reversa, cambios, frenos, dirección y suspensión. Ante síntomas, limitar y escalar.",
          controlCompleto: "Tras validar condiciones seguras, probar en HUB avance/reversa, cambios, respuesta de frenos, dirección y suspensión. Describir golpes, retardos o vibraciones.",
          evidencia: "Registro del recorrido y síntomas; evidencia segura.",
          escalamiento: "Síntoma relevante: detener/limitar la prueba y escalar; no provocar maniobras extremas.",
        },
      ],
    },
    {
      grupo: "3 | Diagnóstico electrónico y sistema eléctrico",
      items: [
        {
          n: "3.01",
          queRevisar: "Preparar motor/contacto según KJI; realizar ODO Check y leer VIN. Guardar captura y contrastar identidad. Sin acceso, PENDIENTE y escalar.",
          controlCompleto: "Apagar el motor y preparar contacto/alimentación según KJI y equipo. Realizar ODO Check y lectura de VIN disponibles; contrastar con datos del grupo 1.",
          evidencia: "Captura con identidad del vehículo y lectura ODO.",
          escalamiento: "Sin acceso o comunicación: PENDIENTE y escalar; no cerrar como escaneo realizado.",
        },
        {
          n: "3.02",
          queRevisar: "Leer motor, transmisión, ABS, airbag y dirección equipados/accesibles; registrar DTC y testigos. No borrar códigos; escalar hallazgos relevantes.",
          controlCompleto: "Leer los módulos críticos equipados y accesibles: motor, transmisión, ABS, airbag y dirección. Registrar DTC/estado y testigos; no borrar códigos.",
          evidencia: "Informe/capturas identificables y tablero.",
          escalamiento: "DTC/testigo relevante o módulo crítico no verificado: escalar antes del cierre.",
        },
        {
          n: "3.03",
          queRevisar: "Ampliar escaneo a BCM/confort. Ante dudas, consultar temperatura, RPM, carga y sensores disponibles; registrar condición y escalar anomalías.",
          controlCompleto: "Ampliar lectura a BCM/confort equipados y accesibles. Consultar temperatura, RPM, carga y sensores disponibles cuando exista duda; registrar la condición.",
          evidencia: "Reporte ampliado; capturas de lectura relevante.",
          escalamiento: "Dato sin referencia o lectura anómala: escalar; no usar un límite universal.",
        },
        {
          n: "3.04",
          queRevisar: "Probar todas las luces exteriores/interiores equipadas. Registrar ubicación y evidencia de falla; evaluar daño físico de ópticos en grupo 7.",
          controlCompleto: "Realizar la prueba de luces equipadas y registrar ubicación de cualquier falla de funcionamiento. La condición física del óptico se registra en grupo 7.",
          evidencia: "Resultado de prueba; foto/video si falla.",
          escalamiento: "Aplicar demérito/validación según STD; no omitir luces por un IQI favorable.",
        },
        {
          n: "3.05",
          queRevisar: "Revisar batería y terminales; probar con equipo y procedimiento disponible. Registrar resultado; demeritar/escalar si no cumple o hay duda.",
          controlCompleto: "Revisar estado de batería y terminales; realizar la comprobación con el equipo disponible según procedimiento y registrar resultado.",
          evidencia: "Resultado de prueba y fotos de anomalía.",
          escalamiento: "Resultado fuera de STD o prueba no concluyente: demeritar/escalar.",
        },
      ],
    },
    {
      grupo: "4 | Estructura",
      items: [
        {
          n: "4.01",
          queRevisar: "Revisar estructura frontal visible; identificar deformaciones o reparaciones. Registrar zona/fotos; diferenciar estética y escalar sospechas.",
          controlCompleto: "Revisar frontal y sus elementos estructurales visibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.02",
          queRevisar: "Revisar estructura lateral copiloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral copiloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.03",
          queRevisar: "Revisar estructura posterior, piso y tina de repuesto accesibles. Registrar deformaciones/reparaciones con fotos y escalar sospechas.",
          controlCompleto: "Revisar zona posterior y piso/tina de repuesto accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.04",
          queRevisar: "Revisar estructura lateral piloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral piloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.05",
          queRevisar: "En las cuatro zonas, revisar uniones, sellos, fijaciones y reparaciones visibles; relacionar con descuadres. Sospecha estructural: escalar.",
          controlCompleto: "En las cuatro zonas revisadas, examinar uniones, sellos, fijaciones y reparaciones visibles. Relacionarlas con descuadres o daños observados.",
          evidencia: "Fotos localizadas de señales de reparación.",
          escalamiento: "Sospecha estructural: profundizar con apoyo técnico; no tratarla solo como pintura.",
        },
      ],
    },
    {
      grupo: "5 | Cerrajería y aperturas",
      items: [
        {
          n: "5.01",
          queRevisar: "Probar aperturas/cierres de puertas, capot, maletero y tapa de combustible. Revisar ajuste y asegurar cierres antes de mover el vehículo.",
          controlCompleto: "Accionar aperturas y cierres equipados. Revisar ajuste y asegurar capot/maletero al finalizar; preparar el vehículo para la vuelta de cerrajería.",
          evidencia: "Registro de prueba; evidencia si hay falla.",
          escalamiento: "Apertura/cierre defectuoso: demeritar o escalar. No mover con cierre inseguro.",
        },
        {
          n: "5.02",
          queRevisar: "Probar cada llave disponible, mando y cierre centralizado. Registrar llave faltante o función defectuosa y aplicar STD.",
          controlCompleto: "Probar las llaves disponibles, funciones de mando y cierre centralizado. Registrar la llave faltante o la función que no responde.",
          evidencia: "Registro por llave; foto/video de falla.",
          escalamiento: "Faltante o falla: registrar el demérito según STD; duda de funcionamiento: escalar.",
        },
        {
          n: "5.03",
          queRevisar: "Comprobar aperturas con mando, llave y comandos interiores equipados; revisar función de inmovilizador sin intervenir. Registrar intermitencias.",
          controlCompleto: "Repetir la comprobación de cada apertura mediante los comandos equipados: interior, mando y llave. Verificar inmovilizador según función disponible, sin intervenirlo.",
          evidencia: "Registro por comando; video si es irregular.",
          escalamiento: "Respuesta intermitente o comando sin funcionar: registrar y escalar/demeritar.",
        },
      ],
    },
    {
      grupo: "6 | Interior y funcionamiento",
      items: [
        {
          n: "6.01",
          queRevisar: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y seguridad accesible. Cruzar desgaste con km/escáner; evidenciar y escalar dudas.",
          controlCompleto: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y elementos de seguridad accesibles. Contrastar desgaste con kilometraje y datos del escáner.",
          evidencia: "Fotos de daño y registro de coherencia.",
          escalamiento: "Duda de desgaste/identidad o seguridad: documentar y escalar sin asumir la causa.",
        },
        {
          n: "6.02",
          queRevisar: "Probar limpiaparabrisas, plumillas, lanzaaguas y claxon. Identificar la función afectada; registrar evidencia y demérito según STD.",
          controlCompleto: "Probar comando y accionamiento de plumillas, jet lanzaaguas y claxon. Registrar la función afectada si hay desvío.",
          evidencia: "Resultado; foto/video si hay falla.",
          escalamiento: "Falla funcional: demeritar según STD y describirla sin generalizar.",
        },
        {
          n: "6.03",
          queRevisar: "Probar A/C y calefacción; medir con termómetro según método vigente. Registrar temperatura y condiciones; escalar resultados no concluyentes.",
          controlCompleto: "Comprobar funcionamiento y registrar temperatura con termómetro según método vigente. Indicar condiciones de la prueba.",
          evidencia: "Lectura del termómetro y registro funcional.",
          escalamiento: "Fuera de STD o prueba no concluyente: demeritar/escalar según corresponda.",
        },
        {
          n: "6.04",
          queRevisar: "Probar pantalla, audio y cámara/sensores de estacionamiento si equipa. Registrar función y síntoma; no equivale a validar ADAS.",
          controlCompleto: "Probar pantalla/audio y la función de cámara/sensores de estacionamiento cuando equipe. Registrar componente y síntoma observado.",
          evidencia: "Resultado; foto/video si falla.",
          escalamiento: "Falla: demeritar/escalar según STD. No confundir esta prueba con validación ADAS.",
        },
        {
          n: "6.05",
          queRevisar: "Probar ventanas y espejos desde sus botoneras; revisar ajustes de habitáculo equipados. Registrar ubicación/función de cada falla.",
          controlCompleto: "Probar los comandos de ventanas y espejos desde las botoneras disponibles; revisar los ajustes de habitáculo que equipe y registrar fallas por función.",
          evidencia: "Registro por función; foto/video si falla.",
          escalamiento: "No generalizar como OK si un comando falla; describir función/ubicación.",
        },
      ],
    },
    {
      grupo: "7 | Estética exterior y repuestos exteriores",
      items: [
        {
          n: "7.01",
          queRevisar: "Recorrer exterior; revisar chapa, pintura y reparaciones. Fotografiar por panel/ubicación. Sospecha estructural: volver al grupo 4 y escalar.",
          controlCompleto: "Recorrer el exterior y revisar daños de chapa/pintura y reparaciones visibles. Documentar panel y ubicación; ampliar si aparece sospecha.",
          evidencia: "Fotos por panel con hallazgo; set según STD.",
          escalamiento: "Daño estético: demeritar. Sospecha estructural: volver a grupo 4 y escalar.",
        },
        {
          n: "7.02",
          queRevisar: "Revisar cristales, ópticos, espejos y piezas exteriores. Fotografiar roturas, reparaciones y faltantes; aplicar STD para reparar/reemplazar.",
          controlCompleto: "Revisar condición física de cristales, ópticos, espejos y piezas exteriores. Identificar roturas, reparaciones y faltantes por ubicación.",
          evidencia: "Foto del componente y detalle del daño.",
          escalamiento: "Aplicar STD para reparar/reemplazar. La prueba de iluminación queda en grupo 3.",
        },
      ],
    },
    {
      grupo: "8 | Control técnico y cierre",
      items: [
        {
          n: "8.01",
          queRevisar: "Validar descripción, categoría, ubicación, evidencia y monto interno de cada hallazgo. Evitar duplicados; NO OK no siempre implica demérito.",
          controlCompleto: "Verificar hallazgo, descripción, categoría, ubicación y monto en el demeritador vigente. Evitar duplicados y corregir inconsistencias antes del envío.",
          evidencia: "Demérito y evidencia asociados.",
          escalamiento: "NO OK no equivale siempre a demérito: diferenciar recotización, validación o rechazo.",
        },
        {
          n: "8.02",
          queRevisar: "Verificar registro de repuesto, herramientas, llaves, funciones y detalles; corregir faltantes o duplicados antes del cierre.",
          controlCompleto: "Revisar que repuesto, herramientas, llaves, funciones y detalles observados estén registrados sin duplicados ni omisiones antes del cierre.",
          evidencia: "Listado conciliado con deméritos.",
          escalamiento: "Faltante o hallazgo sin registro: corregir antes de finalizar.",
        },
        {
          n: "8.03",
          queRevisar: "Revisar los ocho grupos, limitaciones y validaciones. Registrar conclusión según STD; IQI o porcentaje no aprueban por sí solos.",
          controlCompleto: "Revisar los ocho grupos, límites de inspección y validaciones pendientes. Registrar si la unidad puede continuar según STD; el IQI no aprueba por sí solo.",
          evidencia: "Conclusión técnica y decisión registrada.",
          escalamiento: "Duda crítica o criterio de rechazo: escalar/aplicar STD; no forzar aprobación.",
        },
        {
          n: "8.04",
          queRevisar: "Subir evidencia identificable cuanto antes; conciliar datos/deméritos y cerrar FlowBuilder/Slack. No finalizar con información pendiente.",
          controlCompleto: "Cargar evidencia identificable lo antes posible; comprobar coherencia con deméritos y datos actualizados. Enviar FlowBuilder y cerrar el hilo según flujo.",
          evidencia: "Enlace/registro de evidencia y cierre.",
          escalamiento: "Datos, evidencia o recotización pendientes: no finalizar con información incompleta.",
        },
        {
          n: "8.05",
          queRevisar: "Estacionar; explicar resultado, estado y deméritos según STD. Resolver dudas e indicar espera. No dar valores: oferta a cargo de Onboarder Supply.",
          controlCompleto: "Estacionar en zona indicada. Explicar resultado, estado general y deméritos según STD; resolver dudas y orientar la espera. La oferta la presenta Onboarder Supply.",
          evidencia: "Resultado comunicado y continuidad registrada.",
          escalamiento: "No informar valores al cliente ni prometer oferta. Duda técnica: aclarar antes de derivar.",
        },
      ],
    },
  ],
};

const C: Protocolo = {
  grado: "C",
  codigo: "KJI · IQI C",
  nombre: "Inspección Técnica Media",
  rev: "REV 02",
  riesgo: "Medio",
  tiempoObjetivoMin: 35,
  tiempoObjetivoMax: 45,
  aplicaA: "Vehículos con mayor kilometraje, mayor antigüedad, dudas técnicas, síntomas o familia con falla probable.",
  grupos: [
    {
      grupo: "1 | Versiones, identificación y documentación",
      items: [
        {
          n: "1.01",
          queRevisar: "Confirmar cliente, agenda y OPP; comparar ambas patentes con el registro y revisarlas físicamente. Si hay diferencias de identidad, escalar.",
          controlCompleto: "Confirmar cliente, agenda y OPP. Comparar la patente registrada con ambas placas y efectuar su comprobación física según KJI vigente.",
          evidencia: "Patente y registro del caso; fotos según STD.",
          escalamiento: "Diferencia de identidad: detener el cierre y escalar.",
        },
        {
          n: "1.02",
          queRevisar: "Comparar marca, modelo, año, motor, transmisión y equipamiento con la versión cotizada. Si difiere, solicitar recotización.",
          controlCompleto: "Validar marca, modelo, año, motorización, transmisión y equipamiento identificador frente a la versión cotizada.",
          evidencia: "Datos validados y evidencia del equipamiento.",
          escalamiento: "Diferencia de versión: solicitar recotización; no cerrar con datos antiguos.",
        },
        {
          n: "1.03",
          queRevisar: "Contrastar equipamiento diferenciador con una referencia técnica/documental de la versión. Validar diferencias antes del cierre.",
          controlCompleto: "Además de validar datos, contrastar el equipamiento diferenciador con una referencia documental/técnica de la versión correspondiente.",
          evidencia: "Referencia consultada y equipamiento contrastado.",
          escalamiento: "Referencia insuficiente o diferencia: validación de versión antes de cerrar.",
        },
        {
          n: "1.04",
          queRevisar: "Contrastar VIN, número de motor verificable y documentos. Cambio de motor: rechazo, aunque esté documentado. Evidenciar diferencias.",
          controlCompleto: "Contrastar VIN visible, número de motor verificable y documentos disponibles. Registrar cualquier inconsistencia o cambio de motor.",
          evidencia: "Fotos legibles de identificadores/documentos.",
          escalamiento: "Cambio de motor: rechazo incluso documentado. Duda de identidad: escalar.",
        },
        {
          n: "1.05",
          queRevisar: "Comparar odómetro con agenda, OPP y FlowBuilder. Registrar kilometraje real y foto; gestionar diferencias antes de enviar.",
          controlCompleto: "Comparar el odómetro con agenda, OPP y FlowBuilder. Registrar el kilometraje real y diferencias detectadas al inicio.",
          evidencia: "Foto de odómetro y dato de sistema.",
          escalamiento: "Gestionar diferencia de kilometraje; no enviar formulario desactualizado.",
        },
        {
          n: "1.06",
          queRevisar: "Solicitar respaldos de aceite/filtro, distribución si aplica y documentos exigidos. Registrar ausencias y aplicar STD vigente.",
          controlCompleto: "Solicitar comprobantes de aceite/filtro y distribución cuando aplique. Revisar documentación especial exigida en el flujo y registrar ausencias.",
          evidencia: "Comprobante o constancia de su ausencia.",
          escalamiento: "Aplicar el STD y demeritador vigentes; una ausencia no prueba por sí sola una falla.",
        },
        {
          n: "1.07",
          queRevisar: "Cruzar historial por VIN/patente con fechas, kilometraje y mantenciones. Registrar fallas previas e inconsistencias; no suponer antecedentes.",
          controlCompleto: "Relacionar antecedentes disponibles por VIN/patente con fecha, kilometraje y comprobantes. Identificar fallas previas o mantenciones que requieran revisión dirigida.",
          evidencia: "Resumen de antecedentes y respaldo consultado.",
          escalamiento: "Inconsistencia o dato faltante relevante: escalar; no completar historia por suposición.",
        },
        {
          n: "1.08",
          queRevisar: "Abrir FlowBuilder y revisar Inspección Inteligente, historial, alertas y campañas. Confirmar IQI; no asumir A si falta el dato.",
          controlCompleto: "Abrir FlowBuilder y revisar Inspección Inteligente, historial disponible, alertas y campañas aplicables. Confirmar el IQI recibido y datos del caso.",
          evidencia: "Referencia de IQI y consulta de alertas/campañas.",
          escalamiento: "Alerta o IQI no confirmado: consultar al responsable; no asumir nivel A.",
        },
      ],
    },
    {
      grupo: "2 | Mecánica y prueba dinámica",
      items: [
        {
          n: "2.01",
          queRevisar: "Observar arranque, ralentí, ruidos y vibraciones. Registrar condición; ante golpeteo relevante, suspender la prueba de riesgo y escalar.",
          controlCompleto: "Observar el arranque disponible, estabilidad de ralentí, ruidos y vibraciones. Registrar la condición observada sin forzar una falla.",
          evidencia: "Registro de condición; video si hay anomalía.",
          escalamiento: "Golpeteo o síntoma relevante: suspender prueba que agrave el riesgo y escalar.",
        },
        {
          n: "2.02",
          queRevisar: "Observar presencia y persistencia de humo por escape; grabar si existe. No asegurar causa interna sin respaldo; escalar según STD.",
          controlCompleto: "Observar el humo durante el funcionamiento permitido y describir su presencia y persistencia. No asignar una causa interna sin respaldo.",
          evidencia: "Video del humo si existe.",
          escalamiento: "Humo persistente o severo: aplicar criterio de escalamiento/rechazo del STD.",
        },
        {
          n: "2.03",
          queRevisar: "Revisar nivel y aspecto de aceite/refrigerante. No abrir circuitos calientes o presurizados. Evidenciar contaminación y escalar.",
          controlCompleto: "Revisar niveles y aspecto mediante puntos accesibles y método seguro. Registrar indicios de contaminación; no abrir circuitos calientes o presurizados.",
          evidencia: "Registro de niveles/estado; fotos de anomalía.",
          escalamiento: "Contaminación o condición no concluyente: escalar; no afirmar una causa no comprobada.",
        },
        {
          n: "2.04",
          queRevisar: "Revisar motor superior, fugas, sudoraciones y mangueras/conexiones visibles. Fotografiar ubicación; escalar fugas críticas o dudas.",
          controlCompleto: "Revisar vano motor y zonas accesibles: fugas, sudoraciones y estado visible de mangueras/conexiones. Describir ubicación y condición observada.",
          evidencia: "Foto general y detalle de cada hallazgo.",
          escalamiento: "Fuga crítica: escalar/rechazar según STD. Origen incierto: registrar diagnóstico pendiente.",
        },
        {
          n: "2.05",
          queRevisar: "Revisar correas, filtros y accesorios accesibles sin retirar piezas. Diferenciar desgaste de falta de respaldo de mantención; evidenciar.",
          controlCompleto: "Revisar condiciones visibles de correas, filtros accesibles y accesorios del motor, sin retirar componentes. Diferenciar desgaste observado de mantenimiento sin respaldo.",
          evidencia: "Fotos de componente/condición.",
          escalamiento: "Daño o anomalía: aplicar STD y escalar cuando requiera diagnóstico.",
        },
        {
          n: "2.06",
          queRevisar: "Ampliar revisión de depósito, mangueras y conexiones; cruzar niveles, residuos y fugas. No abrir el circuito presurizado; escalar anomalías.",
          controlCompleto: "Ampliar la inspección visual a depósito, mangueras y conexiones accesibles; relacionar nivel, residuos y fugas observadas sin abrir el circuito presurizado.",
          evidencia: "Fotos por zona y condiciones de revisión.",
          escalamiento: "Anomalía de enfriamiento o contaminación: escalar sin asegurar causa interna.",
        },
        {
          n: "2.07",
          queRevisar: "Revisar admisión, PCV y cuerpo de aceleración accesibles, si aplica. Relacionar con humo/ruido/ralentí; no asegurar causa sin pruebas.",
          controlCompleto: "Revisar admisión, PCV y cuerpo de aceleración cuando sean aplicables y accesibles; relacionar indicios visibles con ruido, humo o ralentí observado.",
          evidencia: "Fotos de zona y nota del síntoma.",
          escalamiento: "No atribuir falla interna sin pruebas; registrar la sospecha y solicitar validación.",
        },
        {
          n: "2.08",
          queRevisar: "Revisar soportes accesibles y relacionar vibraciones con ralentí y dinámica ya probados. Registrar cuándo aparece el síntoma.",
          controlCompleto: "Observar soportes accesibles y relacionar vibraciones con las condiciones ya probadas de ralentí y dinámica. Describir cuándo aparece el síntoma.",
          evidencia: "Video/nota de condición si hay síntoma.",
          escalamiento: "Soporte dañado o vibración relevante: demeritar/escalar según STD.",
        },
        {
          n: "2.09",
          queRevisar: "Medir todos los neumáticos de rodado y registrar por rueda. Revisar desgaste, daños y llantas; contrastar con el STD.",
          controlCompleto: "Medir todos los neumáticos de rodado; revisar desgaste, daños y llantas. Registrar la ubicación de cada medición y contrastar con el STD vigente.",
          evidencia: "Medidas por rueda y fotos según STD.",
          escalamiento: "Fuera de STD: demeritar o escalar según gravedad; no omitir una rueda.",
        },
        {
          n: "2.10",
          queRevisar: "Revisar frenos delanteros/traseros y estacionamiento; registrar por eje. Ante condición crítica, no realizar prueba dinámica y escalar.",
          controlCompleto: "Revisar el estado visible y medible de frenos; comprobar estacionamiento según procedimiento. Dejar pendiente lo que no pueda verificarse.",
          evidencia: "Registro por eje; medición/foto cuando corresponda.",
          escalamiento: "Condición crítica: no ejecutar prueba dinámica; escalar según STD.",
        },
        {
          n: "2.11",
          queRevisar: "Con gata y banquillo, según método seguro, revisar fugas, tren delantero y dirección accesibles. Sin apoyo seguro, no levantar.",
          controlCompleto: "Preparar levante con gata y banquillo según KJI seguro. Revisar fugas inferiores, tren delantero, dirección y componentes accesibles.",
          evidencia: "Registro de revisión y fotos de hallazgos.",
          escalamiento: "Sin apoyo/condición segura: no levantar. Punto no verificable: PENDIENTE y escalar.",
        },
        {
          n: "2.12",
          queRevisar: "Con acceso seguro, revisar suspensión trasera, fugas y escape. Evidenciar hallazgos y completar la revisión antes de bajar el vehículo.",
          controlCompleto: "Con acceso seguro, revisar suspensión trasera, fugas y escape visible. Completar los controles inferiores aplicables antes de bajar el vehículo conforme al procedimiento.",
          evidencia: "Registro y fotos de cada hallazgo.",
          escalamiento: "Daño, fuga o holgura relevante: escalar/demeritar según STD.",
        },
        {
          n: "2.13",
          queRevisar: "Detallar pastillas/discos, mangueras, amortiguadores, rótulas, bieletas, bujes y homocinéticas accesibles; relacionar con neumáticos.",
          controlCompleto: "Detallar revisión accesible de pastillas/discos, mangueras, amortiguadores, rótulas, bieletas, bujes y homocinéticas; relacionar con desgaste de neumáticos.",
          evidencia: "Registro por componente y medidas según STD.",
          escalamiento: "Desgaste/rotura/holgura fuera de STD: demeritar/escalar con ubicación exacta.",
        },
        {
          n: "2.14",
          queRevisar: "Revisar escape, soportes, fugas, catalizador y sensores accesibles. Evidenciar ausencia o manipulación; no desarmar y escalar según STD.",
          controlCompleto: "Revisar escape, soportes, fugas y elementos de emisiones visibles, incluidos catalizador y sensores cuando sean accesibles. Identificar indicios de manipulación sin desarmar.",
          evidencia: "Fotos localizadas y registro del componente.",
          escalamiento: "Ausencia, manipulación o fuga relevante: escalar y aplicar STD; no asumir reparación menor.",
        },
        {
          n: "2.15",
          queRevisar: "Revisar rueda de repuesto, herramientas y dado/llave de seguridad. Fotografiar faltantes; guardar y asegurar. Acceso impedido no es OK.",
          controlCompleto: "Retirar y revisar el repuesto según el método del vehículo; comprobar herramientas y dado/llave de seguridad aplicables. Guardar y asegurar al finalizar.",
          evidencia: "Foto del repuesto/kit y faltantes.",
          escalamiento: "Faltante: demeritar según STD. Acceso impedido: registrar y gestionar, no asumir OK.",
        },
        {
          n: "2.16",
          queRevisar: "Con condiciones seguras, probar en HUB avance/reversa, cambios, frenos, dirección y suspensión. Ante síntomas, limitar y escalar.",
          controlCompleto: "Tras validar condiciones seguras, probar en HUB avance/reversa, cambios, respuesta de frenos, dirección y suspensión. Describir golpes, retardos o vibraciones.",
          evidencia: "Registro del recorrido y síntomas; evidencia segura.",
          escalamiento: "Síntoma relevante: detener/limitar la prueba y escalar; no provocar maniobras extremas.",
        },
        {
          n: "2.17",
          queRevisar: "Ampliar prueba según transmisión: cambios, avance/reversa, respuesta y embrague manual. Registrar condición; escalar golpes o retardos.",
          controlCompleto: "Ampliar la prueba permitida según transmisión equipada: cambios, avance/reversa, respuesta y embrague si es manual. Registrar la condición que reproduce el síntoma.",
          evidencia: "Nota técnica/video seguro de la condición.",
          escalamiento: "Retardo, patinamiento, golpe o ruido: escalar a revisión de mayor profundidad.",
        },
      ],
    },
    {
      grupo: "3 | Diagnóstico electrónico y sistema eléctrico",
      items: [
        {
          n: "3.01",
          queRevisar: "Preparar motor/contacto según KJI; realizar ODO Check y leer VIN. Guardar captura y contrastar identidad. Sin acceso, PENDIENTE y escalar.",
          controlCompleto: "Apagar el motor y preparar contacto/alimentación según KJI y equipo. Realizar ODO Check y lectura de VIN disponibles; contrastar con datos del grupo 1.",
          evidencia: "Captura con identidad del vehículo y lectura ODO.",
          escalamiento: "Sin acceso o comunicación: PENDIENTE y escalar; no cerrar como escaneo realizado.",
        },
        {
          n: "3.02",
          queRevisar: "Leer motor, transmisión, ABS, airbag y dirección equipados/accesibles; registrar DTC y testigos. No borrar códigos; escalar hallazgos relevantes.",
          controlCompleto: "Leer los módulos críticos equipados y accesibles: motor, transmisión, ABS, airbag y dirección. Registrar DTC/estado y testigos; no borrar códigos.",
          evidencia: "Informe/capturas identificables y tablero.",
          escalamiento: "DTC/testigo relevante o módulo crítico no verificado: escalar antes del cierre.",
        },
        {
          n: "3.03",
          queRevisar: "Ampliar escaneo a BCM/confort. Ante dudas, consultar temperatura, RPM, carga y sensores disponibles; registrar condición y escalar anomalías.",
          controlCompleto: "Ampliar lectura a BCM/confort equipados y accesibles. Consultar temperatura, RPM, carga y sensores disponibles cuando exista duda; registrar la condición.",
          evidencia: "Reporte ampliado; capturas de lectura relevante.",
          escalamiento: "Dato sin referencia o lectura anómala: escalar; no usar un límite universal.",
        },
        {
          n: "3.04",
          queRevisar: "Registrar datos en vivo de motor/transmisión con parámetro, unidad y condición. Cruzar síntomas, DTC y referencias; una lectura no define rechazo.",
          controlCompleto: "Registrar datos disponibles de motor/transmisión en condiciones identificadas. Correlacionar síntomas, DTC y referencias del fabricante/STD aplicables.",
          evidencia: "Capturas con parámetro, unidad y condición.",
          escalamiento: "Sin referencia válida o dato no concluyente: escalar; no convertir lectura aislada en rechazo.",
        },
        {
          n: "3.05",
          queRevisar: "Consultar freeze frame y estado de DTC si existen; guardar captura. No borrar registros. Indicar ausencia de datos y escalar dudas relevantes.",
          controlCompleto: "Consultar datos congelados y estado de los DTC cuando existan; registrar qué se observó y bajo qué condiciones. No borrar los registros.",
          evidencia: "Captura del freeze frame y código asociado.",
          escalamiento: "Sin datos disponibles: dejar constancia. Duda relevante: mantener pendiente y escalar.",
        },
        {
          n: "3.06",
          queRevisar: "Probar todas las luces exteriores/interiores equipadas. Registrar ubicación y evidencia de falla; evaluar daño físico de ópticos en grupo 7.",
          controlCompleto: "Realizar la prueba de luces equipadas y registrar ubicación de cualquier falla de funcionamiento. La condición física del óptico se registra en grupo 7.",
          evidencia: "Resultado de prueba; foto/video si falla.",
          escalamiento: "Aplicar demérito/validación según STD; no omitir luces por un IQI favorable.",
        },
        {
          n: "3.07",
          queRevisar: "Revisar batería y terminales; probar con equipo y procedimiento disponible. Registrar resultado; demeritar/escalar si no cumple o hay duda.",
          controlCompleto: "Revisar estado de batería y terminales; realizar la comprobación con el equipo disponible según procedimiento y registrar resultado.",
          evidencia: "Resultado de prueba y fotos de anomalía.",
          escalamiento: "Resultado fuera de STD o prueba no concluyente: demeritar/escalar.",
        },
      ],
    },
    {
      grupo: "4 | Estructura",
      items: [
        {
          n: "4.01",
          queRevisar: "Revisar estructura frontal visible; identificar deformaciones o reparaciones. Registrar zona/fotos; diferenciar estética y escalar sospechas.",
          controlCompleto: "Revisar frontal y sus elementos estructurales visibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.02",
          queRevisar: "Revisar estructura lateral copiloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral copiloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.03",
          queRevisar: "Revisar estructura posterior, piso y tina de repuesto accesibles. Registrar deformaciones/reparaciones con fotos y escalar sospechas.",
          controlCompleto: "Revisar zona posterior y piso/tina de repuesto accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.04",
          queRevisar: "Revisar estructura lateral piloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral piloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.05",
          queRevisar: "En las cuatro zonas, revisar uniones, sellos, fijaciones y reparaciones visibles; relacionar con descuadres. Sospecha estructural: escalar.",
          controlCompleto: "En las cuatro zonas revisadas, examinar uniones, sellos, fijaciones y reparaciones visibles. Relacionarlas con descuadres o daños observados.",
          evidencia: "Fotos localizadas de señales de reparación.",
          escalamiento: "Sospecha estructural: profundizar con apoyo técnico; no tratarla solo como pintura.",
        },
        {
          n: "4.06",
          queRevisar: "Ampliar a puntas, marco radiador, torres, zócalos, pilares, piso, tina y largueros accesibles. Fotografiar indicios y validar dudas.",
          controlCompleto: "Ampliar revisión accesible a puntas, marco radiador, torres, zócalos, pilares, piso, tina de repuesto y largueros. Localizar cualquier reparación sospechosa.",
          evidencia: "Fotos por zona/componentes con observación.",
          escalamiento: "Daño estructural: aplicar STD y solicitar validación cuando exista duda.",
        },
      ],
    },
    {
      grupo: "5 | Cerrajería y aperturas",
      items: [
        {
          n: "5.01",
          queRevisar: "Probar aperturas/cierres de puertas, capot, maletero y tapa de combustible. Revisar ajuste y asegurar cierres antes de mover el vehículo.",
          controlCompleto: "Accionar aperturas y cierres equipados. Revisar ajuste y asegurar capot/maletero al finalizar; preparar el vehículo para la vuelta de cerrajería.",
          evidencia: "Registro de prueba; evidencia si hay falla.",
          escalamiento: "Apertura/cierre defectuoso: demeritar o escalar. No mover con cierre inseguro.",
        },
        {
          n: "5.02",
          queRevisar: "Probar cada llave disponible, mando y cierre centralizado. Registrar llave faltante o función defectuosa y aplicar STD.",
          controlCompleto: "Probar las llaves disponibles, funciones de mando y cierre centralizado. Registrar la llave faltante o la función que no responde.",
          evidencia: "Registro por llave; foto/video de falla.",
          escalamiento: "Faltante o falla: registrar el demérito según STD; duda de funcionamiento: escalar.",
        },
        {
          n: "5.03",
          queRevisar: "Comprobar aperturas con mando, llave y comandos interiores equipados; revisar función de inmovilizador sin intervenir. Registrar intermitencias.",
          controlCompleto: "Repetir la comprobación de cada apertura mediante los comandos equipados: interior, mando y llave. Verificar inmovilizador según función disponible, sin intervenirlo.",
          evidencia: "Registro por comando; video si es irregular.",
          escalamiento: "Respuesta intermitente o comando sin funcionar: registrar y escalar/demeritar.",
        },
      ],
    },
    {
      grupo: "6 | Interior y funcionamiento",
      items: [
        {
          n: "6.01",
          queRevisar: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y seguridad accesible. Cruzar desgaste con km/escáner; evidenciar y escalar dudas.",
          controlCompleto: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y elementos de seguridad accesibles. Contrastar desgaste con kilometraje y datos del escáner.",
          evidencia: "Fotos de daño y registro de coherencia.",
          escalamiento: "Duda de desgaste/identidad o seguridad: documentar y escalar sin asumir la causa.",
        },
        {
          n: "6.02",
          queRevisar: "Probar limpiaparabrisas, plumillas, lanzaaguas y claxon. Identificar la función afectada; registrar evidencia y demérito según STD.",
          controlCompleto: "Probar comando y accionamiento de plumillas, jet lanzaaguas y claxon. Registrar la función afectada si hay desvío.",
          evidencia: "Resultado; foto/video si hay falla.",
          escalamiento: "Falla funcional: demeritar según STD y describirla sin generalizar.",
        },
        {
          n: "6.03",
          queRevisar: "Probar A/C y calefacción; medir con termómetro según método vigente. Registrar temperatura y condiciones; escalar resultados no concluyentes.",
          controlCompleto: "Comprobar funcionamiento y registrar temperatura con termómetro según método vigente. Indicar condiciones de la prueba.",
          evidencia: "Lectura del termómetro y registro funcional.",
          escalamiento: "Fuera de STD o prueba no concluyente: demeritar/escalar según corresponda.",
        },
        {
          n: "6.04",
          queRevisar: "Probar pantalla, audio y cámara/sensores de estacionamiento si equipa. Registrar función y síntoma; no equivale a validar ADAS.",
          controlCompleto: "Probar pantalla/audio y la función de cámara/sensores de estacionamiento cuando equipe. Registrar componente y síntoma observado.",
          evidencia: "Resultado; foto/video si falla.",
          escalamiento: "Falla: demeritar/escalar según STD. No confundir esta prueba con validación ADAS.",
        },
        {
          n: "6.05",
          queRevisar: "Probar ventanas y espejos desde sus botoneras; revisar ajustes de habitáculo equipados. Registrar ubicación/función de cada falla.",
          controlCompleto: "Probar los comandos de ventanas y espejos desde las botoneras disponibles; revisar los ajustes de habitáculo que equipe y registrar fallas por función.",
          evidencia: "Registro por función; foto/video si falla.",
          escalamiento: "No generalizar como OK si un comando falla; describir función/ubicación.",
        },
        {
          n: "6.06",
          queRevisar: "Revisar soplador, compuertas, desempañador y confort equipado, incluidos asientos eléctricos. Distinguir falla de ausencia de equipamiento.",
          controlCompleto: "Revisar soplador, compuertas, desempañador y funciones de confort equipadas, incluidos asientos eléctricos. Distinguir falta de función de diferencia de equipamiento.",
          evidencia: "Registro por función/condición; evidencia de falla.",
          escalamiento: "Falla: aplicar STD. No registrar N/A solo por falta de tiempo o acceso.",
        },
      ],
    },
    {
      grupo: "7 | Estética exterior y repuestos exteriores",
      items: [
        {
          n: "7.01",
          queRevisar: "Recorrer exterior; revisar chapa, pintura y reparaciones. Fotografiar por panel/ubicación. Sospecha estructural: volver al grupo 4 y escalar.",
          controlCompleto: "Recorrer el exterior y revisar daños de chapa/pintura y reparaciones visibles. Documentar panel y ubicación; ampliar si aparece sospecha.",
          evidencia: "Fotos por panel con hallazgo; set según STD.",
          escalamiento: "Daño estético: demeritar. Sospecha estructural: volver a grupo 4 y escalar.",
        },
        {
          n: "7.02",
          queRevisar: "Revisar cristales, ópticos, espejos y piezas exteriores. Fotografiar roturas, reparaciones y faltantes; aplicar STD para reparar/reemplazar.",
          controlCompleto: "Revisar condición física de cristales, ópticos, espejos y piezas exteriores. Identificar roturas, reparaciones y faltantes por ubicación.",
          evidencia: "Foto del componente y detalle del daño.",
          escalamiento: "Aplicar STD para reparar/reemplazar. La prueba de iluminación queda en grupo 3.",
        },
      ],
    },
    {
      grupo: "8 | Control técnico y cierre",
      items: [
        {
          n: "8.01",
          queRevisar: "Validar descripción, categoría, ubicación, evidencia y monto interno de cada hallazgo. Evitar duplicados; NO OK no siempre implica demérito.",
          controlCompleto: "Verificar hallazgo, descripción, categoría, ubicación y monto en el demeritador vigente. Evitar duplicados y corregir inconsistencias antes del envío.",
          evidencia: "Demérito y evidencia asociados.",
          escalamiento: "NO OK no equivale siempre a demérito: diferenciar recotización, validación o rechazo.",
        },
        {
          n: "8.02",
          queRevisar: "Verificar registro de repuesto, herramientas, llaves, funciones y detalles; corregir faltantes o duplicados antes del cierre.",
          controlCompleto: "Revisar que repuesto, herramientas, llaves, funciones y detalles observados estén registrados sin duplicados ni omisiones antes del cierre.",
          evidencia: "Listado conciliado con deméritos.",
          escalamiento: "Faltante o hallazgo sin registro: corregir antes de finalizar.",
        },
        {
          n: "8.03",
          queRevisar: "Cruzar dinámica, revisión visual, escáner y evidencia. Separar falla confirmada de diagnóstico pendiente; corregir o escalar incoherencias.",
          controlCompleto: "Conciliar prueba dinámica, inspección visual, escáner y evidencia. Diferenciar componente confirmado de diagnóstico pendiente; evitar atribuciones sin respaldo.",
          evidencia: "Síntesis técnica vinculada a hallazgos.",
          escalamiento: "Conclusión inconsistente o duda no resuelta: corregir/escalar antes de cerrar.",
        },
        {
          n: "8.04",
          queRevisar: "Revisar los ocho grupos, limitaciones y validaciones. Registrar conclusión según STD; IQI o porcentaje no aprueban por sí solos.",
          controlCompleto: "Revisar los ocho grupos, límites de inspección y validaciones pendientes. Registrar si la unidad puede continuar según STD; el IQI no aprueba por sí solo.",
          evidencia: "Conclusión técnica y decisión registrada.",
          escalamiento: "Duda crítica o criterio de rechazo: escalar/aplicar STD; no forzar aprobación.",
        },
        {
          n: "8.05",
          queRevisar: "Subir evidencia identificable cuanto antes; conciliar datos/deméritos y cerrar FlowBuilder/Slack. No finalizar con información pendiente.",
          controlCompleto: "Cargar evidencia identificable lo antes posible; comprobar coherencia con deméritos y datos actualizados. Enviar FlowBuilder y cerrar el hilo según flujo.",
          evidencia: "Enlace/registro de evidencia y cierre.",
          escalamiento: "Datos, evidencia o recotización pendientes: no finalizar con información incompleta.",
        },
        {
          n: "8.06",
          queRevisar: "Estacionar; explicar resultado, estado y deméritos según STD. Resolver dudas e indicar espera. No dar valores: oferta a cargo de Onboarder Supply.",
          controlCompleto: "Estacionar en zona indicada. Explicar resultado, estado general y deméritos según STD; resolver dudas y orientar la espera. La oferta la presenta Onboarder Supply.",
          evidencia: "Resultado comunicado y continuidad registrada.",
          escalamiento: "No informar valores al cliente ni prometer oferta. Duda técnica: aclarar antes de derivar.",
        },
      ],
    },
  ],
};

const D: Protocolo = {
  grado: "D",
  codigo: "KJI · IQI D",
  nombre: "Inspección Crítica",
  rev: "REV 02",
  riesgo: "Alto",
  tiempoObjetivoMin: 45,
  tiempoObjetivoMax: 60,
  aplicaA: "Vehículos de alto riesgo por IQI, alto kilometraje, antigüedad, síntomas, historial, familia sensible o alerta de producto.",
  grupos: [
    {
      grupo: "1 | Versiones, identificación y documentación",
      items: [
        {
          n: "1.01",
          queRevisar: "Confirmar cliente, agenda y OPP; comparar ambas patentes con el registro y revisarlas físicamente. Si hay diferencias de identidad, escalar.",
          controlCompleto: "Confirmar cliente, agenda y OPP. Comparar la patente registrada con ambas placas y efectuar su comprobación física según KJI vigente.",
          evidencia: "Patente y registro del caso; fotos según STD.",
          escalamiento: "Diferencia de identidad: detener el cierre y escalar.",
        },
        {
          n: "1.02",
          queRevisar: "Comparar marca, modelo, año, motor, transmisión y equipamiento con la versión cotizada. Si difiere, solicitar recotización.",
          controlCompleto: "Validar marca, modelo, año, motorización, transmisión y equipamiento identificador frente a la versión cotizada.",
          evidencia: "Datos validados y evidencia del equipamiento.",
          escalamiento: "Diferencia de versión: solicitar recotización; no cerrar con datos antiguos.",
        },
        {
          n: "1.03",
          queRevisar: "Contrastar equipamiento diferenciador con una referencia técnica/documental de la versión. Validar diferencias antes del cierre.",
          controlCompleto: "Además de validar datos, contrastar el equipamiento diferenciador con una referencia documental/técnica de la versión correspondiente.",
          evidencia: "Referencia consultada y equipamiento contrastado.",
          escalamiento: "Referencia insuficiente o diferencia: validación de versión antes de cerrar.",
        },
        {
          n: "1.04",
          queRevisar: "Contrastar VIN, número de motor verificable y documentos. Cambio de motor: rechazo, aunque esté documentado. Evidenciar diferencias.",
          controlCompleto: "Contrastar VIN visible, número de motor verificable y documentos disponibles. Registrar cualquier inconsistencia o cambio de motor.",
          evidencia: "Fotos legibles de identificadores/documentos.",
          escalamiento: "Cambio de motor: rechazo incluso documentado. Duda de identidad: escalar.",
        },
        {
          n: "1.05",
          queRevisar: "Comparar odómetro con agenda, OPP y FlowBuilder. Registrar kilometraje real y foto; gestionar diferencias antes de enviar.",
          controlCompleto: "Comparar el odómetro con agenda, OPP y FlowBuilder. Registrar el kilometraje real y diferencias detectadas al inicio.",
          evidencia: "Foto de odómetro y dato de sistema.",
          escalamiento: "Gestionar diferencia de kilometraje; no enviar formulario desactualizado.",
        },
        {
          n: "1.06",
          queRevisar: "Solicitar respaldos de aceite/filtro, distribución si aplica y documentos exigidos. Registrar ausencias y aplicar STD vigente.",
          controlCompleto: "Solicitar comprobantes de aceite/filtro y distribución cuando aplique. Revisar documentación especial exigida en el flujo y registrar ausencias.",
          evidencia: "Comprobante o constancia de su ausencia.",
          escalamiento: "Aplicar el STD y demeritador vigentes; una ausencia no prueba por sí sola una falla.",
        },
        {
          n: "1.07",
          queRevisar: "Cruzar historial por VIN/patente con fechas, kilometraje y mantenciones. Registrar fallas previas e inconsistencias; no suponer antecedentes.",
          controlCompleto: "Relacionar antecedentes disponibles por VIN/patente con fecha, kilometraje y comprobantes. Identificar fallas previas o mantenciones que requieran revisión dirigida.",
          evidencia: "Resumen de antecedentes y respaldo consultado.",
          escalamiento: "Inconsistencia o dato faltante relevante: escalar; no completar historia por suposición.",
        },
        {
          n: "1.08",
          queRevisar: "Abrir FlowBuilder y revisar Inspección Inteligente, historial, alertas y campañas. Confirmar IQI; no asumir A si falta el dato.",
          controlCompleto: "Abrir FlowBuilder y revisar Inspección Inteligente, historial disponible, alertas y campañas aplicables. Confirmar el IQI recibido y datos del caso.",
          evidencia: "Referencia de IQI y consulta de alertas/campañas.",
          escalamiento: "Alerta o IQI no confirmado: consultar al responsable; no asumir nivel A.",
        },
        {
          n: "1.09",
          queRevisar: "Cruzar IQI, alertas, historial y síntomas; identificar controles a profundizar. Validar el alcance sin cambiar el IQI de origen por cuenta propia.",
          controlCompleto: "Cruzar nivel asignado, alertas, historial y síntomas. Identificar qué sistemas necesitan mayor profundidad y registrar si se requiere aplicar IQI E.",
          evidencia: "Resumen de riesgos y ampliación solicitada.",
          escalamiento: "Escalar alcance con responsable; no cambiar por cuenta propia la clasificación de origen.",
        },
      ],
    },
    {
      grupo: "2 | Mecánica y prueba dinámica",
      items: [
        {
          n: "2.01",
          queRevisar: "Observar arranque, ralentí, ruidos y vibraciones. Registrar condición; ante golpeteo relevante, suspender la prueba de riesgo y escalar.",
          controlCompleto: "Observar el arranque disponible, estabilidad de ralentí, ruidos y vibraciones. Registrar la condición observada sin forzar una falla.",
          evidencia: "Registro de condición; video si hay anomalía.",
          escalamiento: "Golpeteo o síntoma relevante: suspender prueba que agrave el riesgo y escalar.",
        },
        {
          n: "2.02",
          queRevisar: "Observar presencia y persistencia de humo por escape; grabar si existe. No asegurar causa interna sin respaldo; escalar según STD.",
          controlCompleto: "Observar el humo durante el funcionamiento permitido y describir su presencia y persistencia. No asignar una causa interna sin respaldo.",
          evidencia: "Video del humo si existe.",
          escalamiento: "Humo persistente o severo: aplicar criterio de escalamiento/rechazo del STD.",
        },
        {
          n: "2.03",
          queRevisar: "Revisar nivel y aspecto de aceite/refrigerante. No abrir circuitos calientes o presurizados. Evidenciar contaminación y escalar.",
          controlCompleto: "Revisar niveles y aspecto mediante puntos accesibles y método seguro. Registrar indicios de contaminación; no abrir circuitos calientes o presurizados.",
          evidencia: "Registro de niveles/estado; fotos de anomalía.",
          escalamiento: "Contaminación o condición no concluyente: escalar; no afirmar una causa no comprobada.",
        },
        {
          n: "2.04",
          queRevisar: "Revisar motor superior, fugas, sudoraciones y mangueras/conexiones visibles. Fotografiar ubicación; escalar fugas críticas o dudas.",
          controlCompleto: "Revisar vano motor y zonas accesibles: fugas, sudoraciones y estado visible de mangueras/conexiones. Describir ubicación y condición observada.",
          evidencia: "Foto general y detalle de cada hallazgo.",
          escalamiento: "Fuga crítica: escalar/rechazar según STD. Origen incierto: registrar diagnóstico pendiente.",
        },
        {
          n: "2.05",
          queRevisar: "Revisar correas, filtros y accesorios accesibles sin retirar piezas. Diferenciar desgaste de falta de respaldo de mantención; evidenciar.",
          controlCompleto: "Revisar condiciones visibles de correas, filtros accesibles y accesorios del motor, sin retirar componentes. Diferenciar desgaste observado de mantenimiento sin respaldo.",
          evidencia: "Fotos de componente/condición.",
          escalamiento: "Daño o anomalía: aplicar STD y escalar cuando requiera diagnóstico.",
        },
        {
          n: "2.06",
          queRevisar: "Ampliar revisión de depósito, mangueras y conexiones; cruzar niveles, residuos y fugas. No abrir el circuito presurizado; escalar anomalías.",
          controlCompleto: "Ampliar la inspección visual a depósito, mangueras y conexiones accesibles; relacionar nivel, residuos y fugas observadas sin abrir el circuito presurizado.",
          evidencia: "Fotos por zona y condiciones de revisión.",
          escalamiento: "Anomalía de enfriamiento o contaminación: escalar sin asegurar causa interna.",
        },
        {
          n: "2.07",
          queRevisar: "Revisar admisión, PCV y cuerpo de aceleración accesibles, si aplica. Relacionar con humo/ruido/ralentí; no asegurar causa sin pruebas.",
          controlCompleto: "Revisar admisión, PCV y cuerpo de aceleración cuando sean aplicables y accesibles; relacionar indicios visibles con ruido, humo o ralentí observado.",
          evidencia: "Fotos de zona y nota del síntoma.",
          escalamiento: "No atribuir falla interna sin pruebas; registrar la sospecha y solicitar validación.",
        },
        {
          n: "2.08",
          queRevisar: "Revisar soportes accesibles y relacionar vibraciones con ralentí y dinámica ya probados. Registrar cuándo aparece el síntoma.",
          controlCompleto: "Observar soportes accesibles y relacionar vibraciones con las condiciones ya probadas de ralentí y dinámica. Describir cuándo aparece el síntoma.",
          evidencia: "Video/nota de condición si hay síntoma.",
          escalamiento: "Soporte dañado o vibración relevante: demeritar/escalar según STD.",
        },
        {
          n: "2.09",
          queRevisar: "Evaluar respuesta, cortes, ruidos, vibraciones y soportes con método autorizado, sin esfuerzos extremos. Suspender ante síntomas severos.",
          controlCompleto: "Registrar respuesta, cortes, ruidos y vibraciones en las condiciones permitidas por el método autorizado. Evaluar soportes sin provocar esfuerzos o regímenes extremos.",
          evidencia: "Video/nota de condiciones y síntomas.",
          escalamiento: "Síntoma severo: suspender la prueba y escalar conforme al STD.",
        },
        {
          n: "2.10",
          queRevisar: "Medir todos los neumáticos de rodado y registrar por rueda. Revisar desgaste, daños y llantas; contrastar con el STD.",
          controlCompleto: "Medir todos los neumáticos de rodado; revisar desgaste, daños y llantas. Registrar la ubicación de cada medición y contrastar con el STD vigente.",
          evidencia: "Medidas por rueda y fotos según STD.",
          escalamiento: "Fuera de STD: demeritar o escalar según gravedad; no omitir una rueda.",
        },
        {
          n: "2.11",
          queRevisar: "Revisar frenos delanteros/traseros y estacionamiento; registrar por eje. Ante condición crítica, no realizar prueba dinámica y escalar.",
          controlCompleto: "Revisar el estado visible y medible de frenos; comprobar estacionamiento según procedimiento. Dejar pendiente lo que no pueda verificarse.",
          evidencia: "Registro por eje; medición/foto cuando corresponda.",
          escalamiento: "Condición crítica: no ejecutar prueba dinámica; escalar según STD.",
        },
        {
          n: "2.12",
          queRevisar: "Con gata y banquillo, según método seguro, revisar fugas, tren delantero y dirección accesibles. Sin apoyo seguro, no levantar.",
          controlCompleto: "Preparar levante con gata y banquillo según KJI seguro. Revisar fugas inferiores, tren delantero, dirección y componentes accesibles.",
          evidencia: "Registro de revisión y fotos de hallazgos.",
          escalamiento: "Sin apoyo/condición segura: no levantar. Punto no verificable: PENDIENTE y escalar.",
        },
        {
          n: "2.13",
          queRevisar: "Con acceso seguro, revisar suspensión trasera, fugas y escape. Evidenciar hallazgos y completar la revisión antes de bajar el vehículo.",
          controlCompleto: "Con acceso seguro, revisar suspensión trasera, fugas y escape visible. Completar los controles inferiores aplicables antes de bajar el vehículo conforme al procedimiento.",
          evidencia: "Registro y fotos de cada hallazgo.",
          escalamiento: "Daño, fuga o holgura relevante: escalar/demeritar según STD.",
        },
        {
          n: "2.14",
          queRevisar: "Detallar pastillas/discos, mangueras, amortiguadores, rótulas, bieletas, bujes y homocinéticas accesibles; relacionar con neumáticos.",
          controlCompleto: "Detallar revisión accesible de pastillas/discos, mangueras, amortiguadores, rótulas, bieletas, bujes y homocinéticas; relacionar con desgaste de neumáticos.",
          evidencia: "Registro por componente y medidas según STD.",
          escalamiento: "Desgaste/rotura/holgura fuera de STD: demeritar/escalar con ubicación exacta.",
        },
        {
          n: "2.15",
          queRevisar: "Revisar escape, soportes, fugas, catalizador y sensores accesibles. Evidenciar ausencia o manipulación; no desarmar y escalar según STD.",
          controlCompleto: "Revisar escape, soportes, fugas y elementos de emisiones visibles, incluidos catalizador y sensores cuando sean accesibles. Identificar indicios de manipulación sin desarmar.",
          evidencia: "Fotos localizadas y registro del componente.",
          escalamiento: "Ausencia, manipulación o fuga relevante: escalar y aplicar STD; no asumir reparación menor.",
        },
        {
          n: "2.16",
          queRevisar: "Si equipa, ampliar revisión visible/funcional de transfer, diferencial y tren motriz bajo condiciones autorizadas. Evidenciar y escalar síntomas.",
          controlCompleto: "Cuando equipe, ampliar revisión visible y funcional permitida de transfer/diferencial y elementos motrices. Usar solo condiciones autorizadas para ese sistema.",
          evidencia: "Ubicación de fugas/ruidos y prueba realizada.",
          escalamiento: "Síntoma relevante de tren motriz: escalar; no confirmar reparación interna sin diagnóstico.",
        },
        {
          n: "2.17",
          queRevisar: "Revisar rueda de repuesto, herramientas y dado/llave de seguridad. Fotografiar faltantes; guardar y asegurar. Acceso impedido no es OK.",
          controlCompleto: "Retirar y revisar el repuesto según el método del vehículo; comprobar herramientas y dado/llave de seguridad aplicables. Guardar y asegurar al finalizar.",
          evidencia: "Foto del repuesto/kit y faltantes.",
          escalamiento: "Faltante: demeritar según STD. Acceso impedido: registrar y gestionar, no asumir OK.",
        },
        {
          n: "2.18",
          queRevisar: "Con condiciones seguras, probar en HUB avance/reversa, cambios, frenos, dirección y suspensión. Ante síntomas, limitar y escalar.",
          controlCompleto: "Tras validar condiciones seguras, probar en HUB avance/reversa, cambios, respuesta de frenos, dirección y suspensión. Describir golpes, retardos o vibraciones.",
          evidencia: "Registro del recorrido y síntomas; evidencia segura.",
          escalamiento: "Síntoma relevante: detener/limitar la prueba y escalar; no provocar maniobras extremas.",
        },
        {
          n: "2.19",
          queRevisar: "Ampliar prueba según transmisión: cambios, avance/reversa, respuesta y embrague manual. Registrar condición; escalar golpes o retardos.",
          controlCompleto: "Ampliar la prueba permitida según transmisión equipada: cambios, avance/reversa, respuesta y embrague si es manual. Registrar la condición que reproduce el síntoma.",
          evidencia: "Nota técnica/video seguro de la condición.",
          escalamiento: "Retardo, patinamiento, golpe o ruido: escalar a revisión de mayor profundidad.",
        },
      ],
    },
    {
      grupo: "3 | Diagnóstico electrónico y sistema eléctrico",
      items: [
        {
          n: "3.01",
          queRevisar: "Preparar motor/contacto según KJI; realizar ODO Check y leer VIN. Guardar captura y contrastar identidad. Sin acceso, PENDIENTE y escalar.",
          controlCompleto: "Apagar el motor y preparar contacto/alimentación según KJI y equipo. Realizar ODO Check y lectura de VIN disponibles; contrastar con datos del grupo 1.",
          evidencia: "Captura con identidad del vehículo y lectura ODO.",
          escalamiento: "Sin acceso o comunicación: PENDIENTE y escalar; no cerrar como escaneo realizado.",
        },
        {
          n: "3.02",
          queRevisar: "Leer motor, transmisión, ABS, airbag y dirección equipados/accesibles; registrar DTC y testigos. No borrar códigos; escalar hallazgos relevantes.",
          controlCompleto: "Leer los módulos críticos equipados y accesibles: motor, transmisión, ABS, airbag y dirección. Registrar DTC/estado y testigos; no borrar códigos.",
          evidencia: "Informe/capturas identificables y tablero.",
          escalamiento: "DTC/testigo relevante o módulo crítico no verificado: escalar antes del cierre.",
        },
        {
          n: "3.03",
          queRevisar: "Ampliar escaneo a BCM/confort. Ante dudas, consultar temperatura, RPM, carga y sensores disponibles; registrar condición y escalar anomalías.",
          controlCompleto: "Ampliar lectura a BCM/confort equipados y accesibles. Consultar temperatura, RPM, carga y sensores disponibles cuando exista duda; registrar la condición.",
          evidencia: "Reporte ampliado; capturas de lectura relevante.",
          escalamiento: "Dato sin referencia o lectura anómala: escalar; no usar un límite universal.",
        },
        {
          n: "3.04",
          queRevisar: "Registrar datos en vivo de motor/transmisión con parámetro, unidad y condición. Cruzar síntomas, DTC y referencias; una lectura no define rechazo.",
          controlCompleto: "Registrar datos disponibles de motor/transmisión en condiciones identificadas. Correlacionar síntomas, DTC y referencias del fabricante/STD aplicables.",
          evidencia: "Capturas con parámetro, unidad y condición.",
          escalamiento: "Sin referencia válida o dato no concluyente: escalar; no convertir lectura aislada en rechazo.",
        },
        {
          n: "3.05",
          queRevisar: "Consultar freeze frame y estado de DTC si existen; guardar captura. No borrar registros. Indicar ausencia de datos y escalar dudas relevantes.",
          controlCompleto: "Consultar datos congelados y estado de los DTC cuando existan; registrar qué se observó y bajo qué condiciones. No borrar los registros.",
          evidencia: "Captura del freeze frame y código asociado.",
          escalamiento: "Sin datos disponibles: dejar constancia. Duda relevante: mantener pendiente y escalar.",
        },
        {
          n: "3.06",
          queRevisar: "Profundizar VVT, inyección, EGR/EVAP u otros sistemas presentes con referencias autorizadas. Registrar datos; no usar límites universales.",
          controlCompleto: "Profundizar con las lecturas disponibles y pertinentes para VVT, inyección, EGR/EVAP u otros sistemas presentes, vinculándolas a síntomas y referencias autorizadas.",
          evidencia: "Parámetro, unidad, referencia y condición.",
          escalamiento: "No usar rangos universales ni diagnosticar por un valor aislado; escalar incertidumbre.",
        },
        {
          n: "3.07",
          queRevisar: "Realizar solo pruebas activas autorizadas, con equipo compatible y personal habilitado. Registrar respuesta; sin condiciones, PENDIENTE y derivar.",
          controlCompleto: "Ejecutar solo pruebas activas previstas en procedimiento aprobado, con herramienta compatible y personal habilitado. Registrar sistema y respuesta.",
          evidencia: "Reporte de prueba y condiciones autorizadas.",
          escalamiento: "Sin autorización, equipo o condiciones: no ejecutar; PENDIENTE y derivar.",
        },
        {
          n: "3.08",
          queRevisar: "Probar todas las luces exteriores/interiores equipadas. Registrar ubicación y evidencia de falla; evaluar daño físico de ópticos en grupo 7.",
          controlCompleto: "Realizar la prueba de luces equipadas y registrar ubicación de cualquier falla de funcionamiento. La condición física del óptico se registra en grupo 7.",
          evidencia: "Resultado de prueba; foto/video si falla.",
          escalamiento: "Aplicar demérito/validación según STD; no omitir luces por un IQI favorable.",
        },
        {
          n: "3.09",
          queRevisar: "Revisar batería y terminales; probar con equipo y procedimiento disponible. Registrar resultado; demeritar/escalar si no cumple o hay duda.",
          controlCompleto: "Revisar estado de batería y terminales; realizar la comprobación con el equipo disponible según procedimiento y registrar resultado.",
          evidencia: "Resultado de prueba y fotos de anomalía.",
          escalamiento: "Resultado fuera de STD o prueba no concluyente: demeritar/escalar.",
        },
      ],
    },
    {
      grupo: "4 | Estructura",
      items: [
        {
          n: "4.01",
          queRevisar: "Revisar estructura frontal visible; identificar deformaciones o reparaciones. Registrar zona/fotos; diferenciar estética y escalar sospechas.",
          controlCompleto: "Revisar frontal y sus elementos estructurales visibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.02",
          queRevisar: "Revisar estructura lateral copiloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral copiloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.03",
          queRevisar: "Revisar estructura posterior, piso y tina de repuesto accesibles. Registrar deformaciones/reparaciones con fotos y escalar sospechas.",
          controlCompleto: "Revisar zona posterior y piso/tina de repuesto accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.04",
          queRevisar: "Revisar estructura lateral piloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral piloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.05",
          queRevisar: "En las cuatro zonas, revisar uniones, sellos, fijaciones y reparaciones visibles; relacionar con descuadres. Sospecha estructural: escalar.",
          controlCompleto: "En las cuatro zonas revisadas, examinar uniones, sellos, fijaciones y reparaciones visibles. Relacionarlas con descuadres o daños observados.",
          evidencia: "Fotos localizadas de señales de reparación.",
          escalamiento: "Sospecha estructural: profundizar con apoyo técnico; no tratarla solo como pintura.",
        },
        {
          n: "4.06",
          queRevisar: "Ampliar a puntas, marco radiador, torres, zócalos, pilares, piso, tina y largueros accesibles. Fotografiar indicios y validar dudas.",
          controlCompleto: "Ampliar revisión accesible a puntas, marco radiador, torres, zócalos, pilares, piso, tina de repuesto y largueros. Localizar cualquier reparación sospechosa.",
          evidencia: "Fotos por zona/componentes con observación.",
          escalamiento: "Daño estructural: aplicar STD y solicitar validación cuando exista duda.",
        },
        {
          n: "4.07",
          queRevisar: "Cruzar soldaduras/sellos, descuadres y reparaciones con bajos/exterior. Evidenciar por zona; daño relevante: rechazo según STD.",
          controlCompleto: "Relacionar soldaduras/sellos, descuadres y reparaciones por zona con los hallazgos de bajos y exterior. Documentar la ubicación de cada indicio relevante.",
          evidencia: "Serie fotográfica y conclusión por zona.",
          escalamiento: "Daño estructural relevante: rechazo según STD. Duda: validación técnica.",
        },
      ],
    },
    {
      grupo: "5 | Cerrajería y aperturas",
      items: [
        {
          n: "5.01",
          queRevisar: "Probar aperturas/cierres de puertas, capot, maletero y tapa de combustible. Revisar ajuste y asegurar cierres antes de mover el vehículo.",
          controlCompleto: "Accionar aperturas y cierres equipados. Revisar ajuste y asegurar capot/maletero al finalizar; preparar el vehículo para la vuelta de cerrajería.",
          evidencia: "Registro de prueba; evidencia si hay falla.",
          escalamiento: "Apertura/cierre defectuoso: demeritar o escalar. No mover con cierre inseguro.",
        },
        {
          n: "5.02",
          queRevisar: "Probar cada llave disponible, mando y cierre centralizado. Registrar llave faltante o función defectuosa y aplicar STD.",
          controlCompleto: "Probar las llaves disponibles, funciones de mando y cierre centralizado. Registrar la llave faltante o la función que no responde.",
          evidencia: "Registro por llave; foto/video de falla.",
          escalamiento: "Faltante o falla: registrar el demérito según STD; duda de funcionamiento: escalar.",
        },
        {
          n: "5.03",
          queRevisar: "Comprobar aperturas con mando, llave y comandos interiores equipados; revisar función de inmovilizador sin intervenir. Registrar intermitencias.",
          controlCompleto: "Repetir la comprobación de cada apertura mediante los comandos equipados: interior, mando y llave. Verificar inmovilizador según función disponible, sin intervenirlo.",
          evidencia: "Registro por comando; video si es irregular.",
          escalamiento: "Respuesta intermitente o comando sin funcionar: registrar y escalar/demeritar.",
        },
      ],
    },
    {
      grupo: "6 | Interior y funcionamiento",
      items: [
        {
          n: "6.01",
          queRevisar: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y seguridad accesible. Cruzar desgaste con km/escáner; evidenciar y escalar dudas.",
          controlCompleto: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y elementos de seguridad accesibles. Contrastar desgaste con kilometraje y datos del escáner.",
          evidencia: "Fotos de daño y registro de coherencia.",
          escalamiento: "Duda de desgaste/identidad o seguridad: documentar y escalar sin asumir la causa.",
        },
        {
          n: "6.02",
          queRevisar: "Probar limpiaparabrisas, plumillas, lanzaaguas y claxon. Identificar la función afectada; registrar evidencia y demérito según STD.",
          controlCompleto: "Probar comando y accionamiento de plumillas, jet lanzaaguas y claxon. Registrar la función afectada si hay desvío.",
          evidencia: "Resultado; foto/video si hay falla.",
          escalamiento: "Falla funcional: demeritar según STD y describirla sin generalizar.",
        },
        {
          n: "6.03",
          queRevisar: "Probar A/C y calefacción; medir con termómetro según método vigente. Registrar temperatura y condiciones; escalar resultados no concluyentes.",
          controlCompleto: "Comprobar funcionamiento y registrar temperatura con termómetro según método vigente. Indicar condiciones de la prueba.",
          evidencia: "Lectura del termómetro y registro funcional.",
          escalamiento: "Fuera de STD o prueba no concluyente: demeritar/escalar según corresponda.",
        },
        {
          n: "6.04",
          queRevisar: "Probar pantalla, audio y cámara/sensores de estacionamiento si equipa. Registrar función y síntoma; no equivale a validar ADAS.",
          controlCompleto: "Probar pantalla/audio y la función de cámara/sensores de estacionamiento cuando equipe. Registrar componente y síntoma observado.",
          evidencia: "Resultado; foto/video si falla.",
          escalamiento: "Falla: demeritar/escalar según STD. No confundir esta prueba con validación ADAS.",
        },
        {
          n: "6.05",
          queRevisar: "Probar ventanas y espejos desde sus botoneras; revisar ajustes de habitáculo equipados. Registrar ubicación/función de cada falla.",
          controlCompleto: "Probar los comandos de ventanas y espejos desde las botoneras disponibles; revisar los ajustes de habitáculo que equipe y registrar fallas por función.",
          evidencia: "Registro por función; foto/video si falla.",
          escalamiento: "No generalizar como OK si un comando falla; describir función/ubicación.",
        },
        {
          n: "6.06",
          queRevisar: "Revisar soplador, compuertas, desempañador y confort equipado, incluidos asientos eléctricos. Distinguir falla de ausencia de equipamiento.",
          controlCompleto: "Revisar soplador, compuertas, desempañador y funciones de confort equipadas, incluidos asientos eléctricos. Distinguir falta de función de diferencia de equipamiento.",
          evidencia: "Registro por función/condición; evidencia de falla.",
          escalamiento: "Falla: aplicar STD. No registrar N/A solo por falta de tiempo o acceso.",
        },
        {
          n: "6.07",
          queRevisar: "Cruzar funciones de climatización/confort con diagnóstico electrónico ante anomalías. Registrar intermitencias y escalar diferencias.",
          controlCompleto: "Relacionar la prueba funcional de climatización/confort con su diagnóstico electrónico cuando exista anomalía. Registrar funciones sin respuesta o intermitentes.",
          evidencia: "Prueba funcional y lectura asociada si disponible.",
          escalamiento: "Diferencia entre función y diagnóstico: escalar; no marcar todo el sistema OK.",
        },
      ],
    },
    {
      grupo: "7 | Estética exterior y repuestos exteriores",
      items: [
        {
          n: "7.01",
          queRevisar: "Recorrer exterior; revisar chapa, pintura y reparaciones. Fotografiar por panel/ubicación. Sospecha estructural: volver al grupo 4 y escalar.",
          controlCompleto: "Recorrer el exterior y revisar daños de chapa/pintura y reparaciones visibles. Documentar panel y ubicación; ampliar si aparece sospecha.",
          evidencia: "Fotos por panel con hallazgo; set según STD.",
          escalamiento: "Daño estético: demeritar. Sospecha estructural: volver a grupo 4 y escalar.",
        },
        {
          n: "7.02",
          queRevisar: "Revisar cristales, ópticos, espejos y piezas exteriores. Fotografiar roturas, reparaciones y faltantes; aplicar STD para reparar/reemplazar.",
          controlCompleto: "Revisar condición física de cristales, ópticos, espejos y piezas exteriores. Identificar roturas, reparaciones y faltantes por ubicación.",
          evidencia: "Foto del componente y detalle del daño.",
          escalamiento: "Aplicar STD para reparar/reemplazar. La prueba de iluminación queda en grupo 3.",
        },
      ],
    },
    {
      grupo: "8 | Control técnico y cierre",
      items: [
        {
          n: "8.01",
          queRevisar: "Validar descripción, categoría, ubicación, evidencia y monto interno de cada hallazgo. Evitar duplicados; NO OK no siempre implica demérito.",
          controlCompleto: "Verificar hallazgo, descripción, categoría, ubicación y monto en el demeritador vigente. Evitar duplicados y corregir inconsistencias antes del envío.",
          evidencia: "Demérito y evidencia asociados.",
          escalamiento: "NO OK no equivale siempre a demérito: diferenciar recotización, validación o rechazo.",
        },
        {
          n: "8.02",
          queRevisar: "Verificar registro de repuesto, herramientas, llaves, funciones y detalles; corregir faltantes o duplicados antes del cierre.",
          controlCompleto: "Revisar que repuesto, herramientas, llaves, funciones y detalles observados estén registrados sin duplicados ni omisiones antes del cierre.",
          evidencia: "Listado conciliado con deméritos.",
          escalamiento: "Faltante o hallazgo sin registro: corregir antes de finalizar.",
        },
        {
          n: "8.03",
          queRevisar: "Cruzar dinámica, revisión visual, escáner y evidencia. Separar falla confirmada de diagnóstico pendiente; corregir o escalar incoherencias.",
          controlCompleto: "Conciliar prueba dinámica, inspección visual, escáner y evidencia. Diferenciar componente confirmado de diagnóstico pendiente; evitar atribuciones sin respaldo.",
          evidencia: "Síntesis técnica vinculada a hallazgos.",
          escalamiento: "Conclusión inconsistente o duda no resuelta: corregir/escalar antes de cerrar.",
        },
        {
          n: "8.04",
          queRevisar: "Consolidar trabajos y contrastar envergadura con política. Validar costo/tiempo cuando corresponda; no aprobar un posible exceso sin validación.",
          controlCompleto: "Consolidar hallazgos y trabajos necesarios para evaluar su envergadura frente a la política vigente. Solicitar validación de costo/tiempo cuando corresponda.",
          evidencia: "Resumen de trabajos y validación correspondiente.",
          escalamiento: "Posible exceso de política: no aprobar sin validación; no inventar límites de costo.",
        },
        {
          n: "8.05",
          queRevisar: "Ante riesgo crítico, presentar hallazgos/evidencia/limitaciones a TMS/TT&DJ y registrar decisión. Sin caso crítico, N/A con motivo.",
          controlCompleto: "Presentar hallazgos críticos, evidencia, diagnóstico y limitaciones a TMS/TT&DJ. Registrar respuesta y decisión; si no existe caso crítico, justificar N/A.",
          evidencia: "Hilo/validación y responsable de la decisión.",
          escalamiento: "Riesgo crítico sin resolver: no aprobar. Una validación no anula un rechazo obligatorio.",
        },
        {
          n: "8.06",
          queRevisar: "Revisar los ocho grupos, limitaciones y validaciones. Registrar conclusión según STD; IQI o porcentaje no aprueban por sí solos.",
          controlCompleto: "Revisar los ocho grupos, límites de inspección y validaciones pendientes. Registrar si la unidad puede continuar según STD; el IQI no aprueba por sí solo.",
          evidencia: "Conclusión técnica y decisión registrada.",
          escalamiento: "Duda crítica o criterio de rechazo: escalar/aplicar STD; no forzar aprobación.",
        },
        {
          n: "8.07",
          queRevisar: "Subir evidencia identificable cuanto antes; conciliar datos/deméritos y cerrar FlowBuilder/Slack. No finalizar con información pendiente.",
          controlCompleto: "Cargar evidencia identificable lo antes posible; comprobar coherencia con deméritos y datos actualizados. Enviar FlowBuilder y cerrar el hilo según flujo.",
          evidencia: "Enlace/registro de evidencia y cierre.",
          escalamiento: "Datos, evidencia o recotización pendientes: no finalizar con información incompleta.",
        },
        {
          n: "8.08",
          queRevisar: "Estacionar; explicar resultado, estado y deméritos según STD. Resolver dudas e indicar espera. No dar valores: oferta a cargo de Onboarder Supply.",
          controlCompleto: "Estacionar en zona indicada. Explicar resultado, estado general y deméritos según STD; resolver dudas y orientar la espera. La oferta la presenta Onboarder Supply.",
          evidencia: "Resultado comunicado y continuidad registrada.",
          escalamiento: "No informar valores al cliente ni prometer oferta. Duda técnica: aclarar antes de derivar.",
        },
      ],
    },
  ],
};

const E: Protocolo = {
  grado: "E",
  codigo: "KJI · IQI E",
  nombre: "Diferenciada Full / Blacklist",
  rev: "REV 02",
  riesgo: "Muy alto",
  tiempoObjetivoMin: 60,
  tiempoObjetivoMax: 120,
  aplicaA: "Vehículos blacklist, historial de pérdidas/cangrejos, alertas de producto, alto riesgo comercial, síntomas severos o familias sensibles.",
  grupos: [
    {
      grupo: "1 | Versiones, identificación y documentación",
      items: [
        {
          n: "1.01",
          queRevisar: "Confirmar cliente, agenda y OPP; comparar ambas patentes con el registro y revisarlas físicamente. Si hay diferencias de identidad, escalar.",
          controlCompleto: "Confirmar cliente, agenda y OPP. Comparar la patente registrada con ambas placas y efectuar su comprobación física según KJI vigente.",
          evidencia: "Patente y registro del caso; fotos según STD.",
          escalamiento: "Diferencia de identidad: detener el cierre y escalar.",
        },
        {
          n: "1.02",
          queRevisar: "Comparar marca, modelo, año, motor, transmisión y equipamiento con la versión cotizada. Si difiere, solicitar recotización.",
          controlCompleto: "Validar marca, modelo, año, motorización, transmisión y equipamiento identificador frente a la versión cotizada.",
          evidencia: "Datos validados y evidencia del equipamiento.",
          escalamiento: "Diferencia de versión: solicitar recotización; no cerrar con datos antiguos.",
        },
        {
          n: "1.03",
          queRevisar: "Contrastar equipamiento diferenciador con una referencia técnica/documental de la versión. Validar diferencias antes del cierre.",
          controlCompleto: "Además de validar datos, contrastar el equipamiento diferenciador con una referencia documental/técnica de la versión correspondiente.",
          evidencia: "Referencia consultada y equipamiento contrastado.",
          escalamiento: "Referencia insuficiente o diferencia: validación de versión antes de cerrar.",
        },
        {
          n: "1.04",
          queRevisar: "Contrastar VIN, número de motor verificable y documentos. Cambio de motor: rechazo, aunque esté documentado. Evidenciar diferencias.",
          controlCompleto: "Contrastar VIN visible, número de motor verificable y documentos disponibles. Registrar cualquier inconsistencia o cambio de motor.",
          evidencia: "Fotos legibles de identificadores/documentos.",
          escalamiento: "Cambio de motor: rechazo incluso documentado. Duda de identidad: escalar.",
        },
        {
          n: "1.05",
          queRevisar: "Comparar odómetro con agenda, OPP y FlowBuilder. Registrar kilometraje real y foto; gestionar diferencias antes de enviar.",
          controlCompleto: "Comparar el odómetro con agenda, OPP y FlowBuilder. Registrar el kilometraje real y diferencias detectadas al inicio.",
          evidencia: "Foto de odómetro y dato de sistema.",
          escalamiento: "Gestionar diferencia de kilometraje; no enviar formulario desactualizado.",
        },
        {
          n: "1.06",
          queRevisar: "Solicitar respaldos de aceite/filtro, distribución si aplica y documentos exigidos. Registrar ausencias y aplicar STD vigente.",
          controlCompleto: "Solicitar comprobantes de aceite/filtro y distribución cuando aplique. Revisar documentación especial exigida en el flujo y registrar ausencias.",
          evidencia: "Comprobante o constancia de su ausencia.",
          escalamiento: "Aplicar el STD y demeritador vigentes; una ausencia no prueba por sí sola una falla.",
        },
        {
          n: "1.07",
          queRevisar: "Cruzar historial por VIN/patente con fechas, kilometraje y mantenciones. Registrar fallas previas e inconsistencias; no suponer antecedentes.",
          controlCompleto: "Relacionar antecedentes disponibles por VIN/patente con fecha, kilometraje y comprobantes. Identificar fallas previas o mantenciones que requieran revisión dirigida.",
          evidencia: "Resumen de antecedentes y respaldo consultado.",
          escalamiento: "Inconsistencia o dato faltante relevante: escalar; no completar historia por suposición.",
        },
        {
          n: "1.08",
          queRevisar: "Abrir FlowBuilder y revisar Inspección Inteligente, historial, alertas y campañas. Confirmar IQI; no asumir A si falta el dato.",
          controlCompleto: "Abrir FlowBuilder y revisar Inspección Inteligente, historial disponible, alertas y campañas aplicables. Confirmar el IQI recibido y datos del caso.",
          evidencia: "Referencia de IQI y consulta de alertas/campañas.",
          escalamiento: "Alerta o IQI no confirmado: consultar al responsable; no asumir nivel A.",
        },
        {
          n: "1.09",
          queRevisar: "Cruzar IQI, alertas, historial y síntomas; identificar controles a profundizar. Validar el alcance sin cambiar el IQI de origen por cuenta propia.",
          controlCompleto: "Cruzar nivel asignado, alertas, historial y síntomas. Identificar qué sistemas necesitan mayor profundidad y registrar si se requiere aplicar IQI E.",
          evidencia: "Resumen de riesgos y ampliación solicitada.",
          escalamiento: "Escalar alcance con responsable; no cambiar por cuenta propia la clasificación de origen.",
        },
        {
          n: "1.10",
          queRevisar: "Revisar blacklist, devoluciones, pérdidas/cangrejos y fallas previas. Confirmar elegibilidad; IQI E no permite comprar unidades excluidas.",
          controlCompleto: "Revisar antecedentes disponibles de blacklist, devoluciones, pérdidas/cangrejos y fallas previas por VIN/patente. Confirmar elegibilidad antes de continuar.",
          evidencia: "Resumen trazable de antecedentes y consulta.",
          escalamiento: "Antecedente incompatible con STD: rechazo. IQI E no autoriza comprar vehículos excluidos.",
        },
      ],
    },
    {
      grupo: "2 | Mecánica y prueba dinámica",
      items: [
        {
          n: "2.01",
          queRevisar: "Observar arranque, ralentí, ruidos y vibraciones. Registrar condición; ante golpeteo relevante, suspender la prueba de riesgo y escalar.",
          controlCompleto: "Observar el arranque disponible, estabilidad de ralentí, ruidos y vibraciones. Registrar la condición observada sin forzar una falla.",
          evidencia: "Registro de condición; video si hay anomalía.",
          escalamiento: "Golpeteo o síntoma relevante: suspender prueba que agrave el riesgo y escalar.",
        },
        {
          n: "2.02",
          queRevisar: "Comprobar motor en frío y caliente solo si está disponible y permitido. Registrar condición no verificada como PENDIENTE y validar.",
          controlCompleto: "Verificar arranque y comportamiento en ambas condiciones solo si están disponibles y el procedimiento lo permite. Registrar qué condición no pudo comprobarse.",
          evidencia: "Condiciones, registros y video de síntomas.",
          escalamiento: "Condición no disponible: PENDIENTE y validar cómo completarla; no simular verificación.",
        },
        {
          n: "2.03",
          queRevisar: "Observar presencia y persistencia de humo por escape; grabar si existe. No asegurar causa interna sin respaldo; escalar según STD.",
          controlCompleto: "Observar el humo durante el funcionamiento permitido y describir su presencia y persistencia. No asignar una causa interna sin respaldo.",
          evidencia: "Video del humo si existe.",
          escalamiento: "Humo persistente o severo: aplicar criterio de escalamiento/rechazo del STD.",
        },
        {
          n: "2.04",
          queRevisar: "Revisar nivel y aspecto de aceite/refrigerante. No abrir circuitos calientes o presurizados. Evidenciar contaminación y escalar.",
          controlCompleto: "Revisar niveles y aspecto mediante puntos accesibles y método seguro. Registrar indicios de contaminación; no abrir circuitos calientes o presurizados.",
          evidencia: "Registro de niveles/estado; fotos de anomalía.",
          escalamiento: "Contaminación o condición no concluyente: escalar; no afirmar una causa no comprobada.",
        },
        {
          n: "2.05",
          queRevisar: "Revisar motor superior, fugas, sudoraciones y mangueras/conexiones visibles. Fotografiar ubicación; escalar fugas críticas o dudas.",
          controlCompleto: "Revisar vano motor y zonas accesibles: fugas, sudoraciones y estado visible de mangueras/conexiones. Describir ubicación y condición observada.",
          evidencia: "Foto general y detalle de cada hallazgo.",
          escalamiento: "Fuga crítica: escalar/rechazar según STD. Origen incierto: registrar diagnóstico pendiente.",
        },
        {
          n: "2.06",
          queRevisar: "Revisar correas, filtros y accesorios accesibles sin retirar piezas. Diferenciar desgaste de falta de respaldo de mantención; evidenciar.",
          controlCompleto: "Revisar condiciones visibles de correas, filtros accesibles y accesorios del motor, sin retirar componentes. Diferenciar desgaste observado de mantenimiento sin respaldo.",
          evidencia: "Fotos de componente/condición.",
          escalamiento: "Daño o anomalía: aplicar STD y escalar cuando requiera diagnóstico.",
        },
        {
          n: "2.07",
          queRevisar: "Ampliar revisión de depósito, mangueras y conexiones; cruzar niveles, residuos y fugas. No abrir el circuito presurizado; escalar anomalías.",
          controlCompleto: "Ampliar la inspección visual a depósito, mangueras y conexiones accesibles; relacionar nivel, residuos y fugas observadas sin abrir el circuito presurizado.",
          evidencia: "Fotos por zona y condiciones de revisión.",
          escalamiento: "Anomalía de enfriamiento o contaminación: escalar sin asegurar causa interna.",
        },
        {
          n: "2.08",
          queRevisar: "Revisar admisión, PCV y cuerpo de aceleración accesibles, si aplica. Relacionar con humo/ruido/ralentí; no asegurar causa sin pruebas.",
          controlCompleto: "Revisar admisión, PCV y cuerpo de aceleración cuando sean aplicables y accesibles; relacionar indicios visibles con ruido, humo o ralentí observado.",
          evidencia: "Fotos de zona y nota del síntoma.",
          escalamiento: "No atribuir falla interna sin pruebas; registrar la sospecha y solicitar validación.",
        },
        {
          n: "2.09",
          queRevisar: "Revisar soportes accesibles y relacionar vibraciones con ralentí y dinámica ya probados. Registrar cuándo aparece el síntoma.",
          controlCompleto: "Observar soportes accesibles y relacionar vibraciones con las condiciones ya probadas de ralentí y dinámica. Describir cuándo aparece el síntoma.",
          evidencia: "Video/nota de condición si hay síntoma.",
          escalamiento: "Soporte dañado o vibración relevante: demeritar/escalar según STD.",
        },
        {
          n: "2.10",
          queRevisar: "Evaluar respuesta, cortes, ruidos, vibraciones y soportes con método autorizado, sin esfuerzos extremos. Suspender ante síntomas severos.",
          controlCompleto: "Registrar respuesta, cortes, ruidos y vibraciones en las condiciones permitidas por el método autorizado. Evaluar soportes sin provocar esfuerzos o regímenes extremos.",
          evidencia: "Video/nota de condiciones y síntomas.",
          escalamiento: "Síntoma severo: suspender la prueba y escalar conforme al STD.",
        },
        {
          n: "2.11",
          queRevisar: "Medir todos los neumáticos de rodado y registrar por rueda. Revisar desgaste, daños y llantas; contrastar con el STD.",
          controlCompleto: "Medir todos los neumáticos de rodado; revisar desgaste, daños y llantas. Registrar la ubicación de cada medición y contrastar con el STD vigente.",
          evidencia: "Medidas por rueda y fotos según STD.",
          escalamiento: "Fuera de STD: demeritar o escalar según gravedad; no omitir una rueda.",
        },
        {
          n: "2.12",
          queRevisar: "Revisar frenos delanteros/traseros y estacionamiento; registrar por eje. Ante condición crítica, no realizar prueba dinámica y escalar.",
          controlCompleto: "Revisar el estado visible y medible de frenos; comprobar estacionamiento según procedimiento. Dejar pendiente lo que no pueda verificarse.",
          evidencia: "Registro por eje; medición/foto cuando corresponda.",
          escalamiento: "Condición crítica: no ejecutar prueba dinámica; escalar según STD.",
        },
        {
          n: "2.13",
          queRevisar: "Con gata y banquillo, según método seguro, revisar fugas, tren delantero y dirección accesibles. Sin apoyo seguro, no levantar.",
          controlCompleto: "Preparar levante con gata y banquillo según KJI seguro. Revisar fugas inferiores, tren delantero, dirección y componentes accesibles.",
          evidencia: "Registro de revisión y fotos de hallazgos.",
          escalamiento: "Sin apoyo/condición segura: no levantar. Punto no verificable: PENDIENTE y escalar.",
        },
        {
          n: "2.14",
          queRevisar: "Con acceso seguro, revisar suspensión trasera, fugas y escape. Evidenciar hallazgos y completar la revisión antes de bajar el vehículo.",
          controlCompleto: "Con acceso seguro, revisar suspensión trasera, fugas y escape visible. Completar los controles inferiores aplicables antes de bajar el vehículo conforme al procedimiento.",
          evidencia: "Registro y fotos de cada hallazgo.",
          escalamiento: "Daño, fuga o holgura relevante: escalar/demeritar según STD.",
        },
        {
          n: "2.15",
          queRevisar: "Detallar pastillas/discos, mangueras, amortiguadores, rótulas, bieletas, bujes y homocinéticas accesibles; relacionar con neumáticos.",
          controlCompleto: "Detallar revisión accesible de pastillas/discos, mangueras, amortiguadores, rótulas, bieletas, bujes y homocinéticas; relacionar con desgaste de neumáticos.",
          evidencia: "Registro por componente y medidas según STD.",
          escalamiento: "Desgaste/rotura/holgura fuera de STD: demeritar/escalar con ubicación exacta.",
        },
        {
          n: "2.16",
          queRevisar: "Revisar escape, soportes, fugas, catalizador y sensores accesibles. Evidenciar ausencia o manipulación; no desarmar y escalar según STD.",
          controlCompleto: "Revisar escape, soportes, fugas y elementos de emisiones visibles, incluidos catalizador y sensores cuando sean accesibles. Identificar indicios de manipulación sin desarmar.",
          evidencia: "Fotos localizadas y registro del componente.",
          escalamiento: "Ausencia, manipulación o fuga relevante: escalar y aplicar STD; no asumir reparación menor.",
        },
        {
          n: "2.17",
          queRevisar: "Si equipa, ampliar revisión visible/funcional de transfer, diferencial y tren motriz bajo condiciones autorizadas. Evidenciar y escalar síntomas.",
          controlCompleto: "Cuando equipe, ampliar revisión visible y funcional permitida de transfer/diferencial y elementos motrices. Usar solo condiciones autorizadas para ese sistema.",
          evidencia: "Ubicación de fugas/ruidos y prueba realizada.",
          escalamiento: "Síntoma relevante de tren motriz: escalar; no confirmar reparación interna sin diagnóstico.",
        },
        {
          n: "2.18",
          queRevisar: "Revisar rueda de repuesto, herramientas y dado/llave de seguridad. Fotografiar faltantes; guardar y asegurar. Acceso impedido no es OK.",
          controlCompleto: "Retirar y revisar el repuesto según el método del vehículo; comprobar herramientas y dado/llave de seguridad aplicables. Guardar y asegurar al finalizar.",
          evidencia: "Foto del repuesto/kit y faltantes.",
          escalamiento: "Faltante: demeritar según STD. Acceso impedido: registrar y gestionar, no asumir OK.",
        },
        {
          n: "2.19",
          queRevisar: "Con condiciones seguras, probar en HUB avance/reversa, cambios, frenos, dirección y suspensión. Ante síntomas, limitar y escalar.",
          controlCompleto: "Tras validar condiciones seguras, probar en HUB avance/reversa, cambios, respuesta de frenos, dirección y suspensión. Describir golpes, retardos o vibraciones.",
          evidencia: "Registro del recorrido y síntomas; evidencia segura.",
          escalamiento: "Síntoma relevante: detener/limitar la prueba y escalar; no provocar maniobras extremas.",
        },
        {
          n: "2.20",
          queRevisar: "Ampliar prueba según transmisión: cambios, avance/reversa, respuesta y embrague manual. Registrar condición; escalar golpes o retardos.",
          controlCompleto: "Ampliar la prueba permitida según transmisión equipada: cambios, avance/reversa, respuesta y embrague si es manual. Registrar la condición que reproduce el síntoma.",
          evidencia: "Nota técnica/video seguro de la condición.",
          escalamiento: "Retardo, patinamiento, golpe o ruido: escalar a revisión de mayor profundidad.",
        },
        {
          n: "2.21",
          queRevisar: "Completar frenado, giros, respuesta y transmisión en recorrido autorizado. Registrar condiciones, duración y límites; no forzar si hay riesgo.",
          controlCompleto: "Completar las condiciones adicionales de frenado, giros, respuesta y transmisión que permita el recorrido aprobado. Registrar duración, condiciones y limitaciones.",
          evidencia: "Registro de condiciones y evidencia segura.",
          escalamiento: "Sin recorrido autorizado o con riesgo: no forzar la prueba; dejar pendiente/derivar.",
        },
      ],
    },
    {
      grupo: "3 | Diagnóstico electrónico y sistema eléctrico",
      items: [
        {
          n: "3.01",
          queRevisar: "Preparar motor/contacto según KJI; realizar ODO Check y leer VIN. Guardar captura y contrastar identidad. Sin acceso, PENDIENTE y escalar.",
          controlCompleto: "Apagar el motor y preparar contacto/alimentación según KJI y equipo. Realizar ODO Check y lectura de VIN disponibles; contrastar con datos del grupo 1.",
          evidencia: "Captura con identidad del vehículo y lectura ODO.",
          escalamiento: "Sin acceso o comunicación: PENDIENTE y escalar; no cerrar como escaneo realizado.",
        },
        {
          n: "3.02",
          queRevisar: "Leer motor, transmisión, ABS, airbag y dirección equipados/accesibles; registrar DTC y testigos. No borrar códigos; escalar hallazgos relevantes.",
          controlCompleto: "Leer los módulos críticos equipados y accesibles: motor, transmisión, ABS, airbag y dirección. Registrar DTC/estado y testigos; no borrar códigos.",
          evidencia: "Informe/capturas identificables y tablero.",
          escalamiento: "DTC/testigo relevante o módulo crítico no verificado: escalar antes del cierre.",
        },
        {
          n: "3.03",
          queRevisar: "Ampliar escaneo a BCM/confort. Ante dudas, consultar temperatura, RPM, carga y sensores disponibles; registrar condición y escalar anomalías.",
          controlCompleto: "Ampliar lectura a BCM/confort equipados y accesibles. Consultar temperatura, RPM, carga y sensores disponibles cuando exista duda; registrar la condición.",
          evidencia: "Reporte ampliado; capturas de lectura relevante.",
          escalamiento: "Dato sin referencia o lectura anómala: escalar; no usar un límite universal.",
        },
        {
          n: "3.04",
          queRevisar: "Registrar datos en vivo de motor/transmisión con parámetro, unidad y condición. Cruzar síntomas, DTC y referencias; una lectura no define rechazo.",
          controlCompleto: "Registrar datos disponibles de motor/transmisión en condiciones identificadas. Correlacionar síntomas, DTC y referencias del fabricante/STD aplicables.",
          evidencia: "Capturas con parámetro, unidad y condición.",
          escalamiento: "Sin referencia válida o dato no concluyente: escalar; no convertir lectura aislada en rechazo.",
        },
        {
          n: "3.05",
          queRevisar: "Consultar freeze frame y estado de DTC si existen; guardar captura. No borrar registros. Indicar ausencia de datos y escalar dudas relevantes.",
          controlCompleto: "Consultar datos congelados y estado de los DTC cuando existan; registrar qué se observó y bajo qué condiciones. No borrar los registros.",
          evidencia: "Captura del freeze frame y código asociado.",
          escalamiento: "Sin datos disponibles: dejar constancia. Duda relevante: mantener pendiente y escalar.",
        },
        {
          n: "3.06",
          queRevisar: "Profundizar VVT, inyección, EGR/EVAP u otros sistemas presentes con referencias autorizadas. Registrar datos; no usar límites universales.",
          controlCompleto: "Profundizar con las lecturas disponibles y pertinentes para VVT, inyección, EGR/EVAP u otros sistemas presentes, vinculándolas a síntomas y referencias autorizadas.",
          evidencia: "Parámetro, unidad, referencia y condición.",
          escalamiento: "No usar rangos universales ni diagnosticar por un valor aislado; escalar incertidumbre.",
        },
        {
          n: "3.07",
          queRevisar: "Realizar solo pruebas activas autorizadas, con equipo compatible y personal habilitado. Registrar respuesta; sin condiciones, PENDIENTE y derivar.",
          controlCompleto: "Ejecutar solo pruebas activas previstas en procedimiento aprobado, con herramienta compatible y personal habilitado. Registrar sistema y respuesta.",
          evidencia: "Reporte de prueba y condiciones autorizadas.",
          escalamiento: "Sin autorización, equipo o condiciones: no ejecutar; PENDIENTE y derivar.",
        },
        {
          n: "3.08",
          queRevisar: "Si equipa, consultar alertas, diagnóstico y calibración ADAS/cámaras/radar. Solo pruebas autorizadas; no calibrar ni actualizar. Escalar fallas.",
          controlCompleto: "Cuando equipe, consultar advertencias, diagnóstico y estado de calibración disponible de ADAS/cámaras/radar. Realizar solo comprobaciones funcionales autorizadas.",
          evidencia: "Reporte, advertencias y prueba permitida.",
          escalamiento: "Falla o calibración pendiente: escalar. No calibrar ni actualizar durante esta inspección.",
        },
        {
          n: "3.09",
          queRevisar: "Revisar humedad, sulfatación, arneses y sellos accesibles. No desconectar, medir ni intervenir SRS/alta tensión; evidenciar y escalar riesgos.",
          controlCompleto: "Inspeccionar visualmente zonas accesibles, arneses, sellos y signos de humedad/sulfatación. No desconectar, medir ni intervenir circuitos SRS o de alta tensión.",
          evidencia: "Fotos de indicios y registro de acceso limitado.",
          escalamiento: "Intervención/humedad crítica: escalar/rechazar según STD; no manipular para confirmar.",
        },
        {
          n: "3.10",
          queRevisar: "Probar todas las luces exteriores/interiores equipadas. Registrar ubicación y evidencia de falla; evaluar daño físico de ópticos en grupo 7.",
          controlCompleto: "Realizar la prueba de luces equipadas y registrar ubicación de cualquier falla de funcionamiento. La condición física del óptico se registra en grupo 7.",
          evidencia: "Resultado de prueba; foto/video si falla.",
          escalamiento: "Aplicar demérito/validación según STD; no omitir luces por un IQI favorable.",
        },
        {
          n: "3.11",
          queRevisar: "Revisar batería y terminales; probar con equipo y procedimiento disponible. Registrar resultado; demeritar/escalar si no cumple o hay duda.",
          controlCompleto: "Revisar estado de batería y terminales; realizar la comprobación con el equipo disponible según procedimiento y registrar resultado.",
          evidencia: "Resultado de prueba y fotos de anomalía.",
          escalamiento: "Resultado fuera de STD o prueba no concluyente: demeritar/escalar.",
        },
      ],
    },
    {
      grupo: "4 | Estructura",
      items: [
        {
          n: "4.01",
          queRevisar: "Revisar estructura frontal visible; identificar deformaciones o reparaciones. Registrar zona/fotos; diferenciar estética y escalar sospechas.",
          controlCompleto: "Revisar frontal y sus elementos estructurales visibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.02",
          queRevisar: "Revisar estructura lateral copiloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral copiloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.03",
          queRevisar: "Revisar estructura posterior, piso y tina de repuesto accesibles. Registrar deformaciones/reparaciones con fotos y escalar sospechas.",
          controlCompleto: "Revisar zona posterior y piso/tina de repuesto accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.04",
          queRevisar: "Revisar estructura lateral piloto accesible; identificar deformaciones o reparaciones. Registrar zona/fotos y escalar sospechas.",
          controlCompleto: "Revisar lateral piloto y sus zonas estructurales accesibles. Identificar deformaciones o señales de reparación y diferenciar daño estructural de detalle estético.",
          evidencia: "Registro por zona y fotos de sospecha/hallazgo.",
          escalamiento: "Sospecha estructural: escalar de inmediato; rechazo según STD vigente.",
        },
        {
          n: "4.05",
          queRevisar: "En las cuatro zonas, revisar uniones, sellos, fijaciones y reparaciones visibles; relacionar con descuadres. Sospecha estructural: escalar.",
          controlCompleto: "En las cuatro zonas revisadas, examinar uniones, sellos, fijaciones y reparaciones visibles. Relacionarlas con descuadres o daños observados.",
          evidencia: "Fotos localizadas de señales de reparación.",
          escalamiento: "Sospecha estructural: profundizar con apoyo técnico; no tratarla solo como pintura.",
        },
        {
          n: "4.06",
          queRevisar: "Ampliar a puntas, marco radiador, torres, zócalos, pilares, piso, tina y largueros accesibles. Fotografiar indicios y validar dudas.",
          controlCompleto: "Ampliar revisión accesible a puntas, marco radiador, torres, zócalos, pilares, piso, tina de repuesto y largueros. Localizar cualquier reparación sospechosa.",
          evidencia: "Fotos por zona/componentes con observación.",
          escalamiento: "Daño estructural: aplicar STD y solicitar validación cuando exista duda.",
        },
        {
          n: "4.07",
          queRevisar: "Cruzar soldaduras/sellos, descuadres y reparaciones con bajos/exterior. Evidenciar por zona; daño relevante: rechazo según STD.",
          controlCompleto: "Relacionar soldaduras/sellos, descuadres y reparaciones por zona con los hallazgos de bajos y exterior. Documentar la ubicación de cada indicio relevante.",
          evidencia: "Serie fotográfica y conclusión por zona.",
          escalamiento: "Daño estructural relevante: rechazo según STD. Duda: validación técnica.",
        },
        {
          n: "4.08",
          queRevisar: "Consolidar las cuatro zonas e indicios estructurales. Registrar zonas no verificables y validar dudas críticas antes de cerrar como conforme.",
          controlCompleto: "Consolidar la revisión de las cuatro zonas, reparaciones e indicios. Solicitar validación especializada ante duda y registrar cualquier zona no verificable.",
          evidencia: "Conclusión por zona y respaldo del dictamen.",
          escalamiento: "No cerrar como estructura conforme con dudas críticas pendientes.",
        },
      ],
    },
    {
      grupo: "5 | Cerrajería y aperturas",
      items: [
        {
          n: "5.01",
          queRevisar: "Probar aperturas/cierres de puertas, capot, maletero y tapa de combustible. Revisar ajuste y asegurar cierres antes de mover el vehículo.",
          controlCompleto: "Accionar aperturas y cierres equipados. Revisar ajuste y asegurar capot/maletero al finalizar; preparar el vehículo para la vuelta de cerrajería.",
          evidencia: "Registro de prueba; evidencia si hay falla.",
          escalamiento: "Apertura/cierre defectuoso: demeritar o escalar. No mover con cierre inseguro.",
        },
        {
          n: "5.02",
          queRevisar: "Probar cada llave disponible, mando y cierre centralizado. Registrar llave faltante o función defectuosa y aplicar STD.",
          controlCompleto: "Probar las llaves disponibles, funciones de mando y cierre centralizado. Registrar la llave faltante o la función que no responde.",
          evidencia: "Registro por llave; foto/video de falla.",
          escalamiento: "Faltante o falla: registrar el demérito según STD; duda de funcionamiento: escalar.",
        },
        {
          n: "5.03",
          queRevisar: "Comprobar aperturas con mando, llave y comandos interiores equipados; revisar función de inmovilizador sin intervenir. Registrar intermitencias.",
          controlCompleto: "Repetir la comprobación de cada apertura mediante los comandos equipados: interior, mando y llave. Verificar inmovilizador según función disponible, sin intervenirlo.",
          evidencia: "Registro por comando; video si es irregular.",
          escalamiento: "Respuesta intermitente o comando sin funcionar: registrar y escalar/demeritar.",
        },
      ],
    },
    {
      grupo: "6 | Interior y funcionamiento",
      items: [
        {
          n: "6.01",
          queRevisar: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y seguridad accesible. Cruzar desgaste con km/escáner; evidenciar y escalar dudas.",
          controlCompleto: "Revisar plazas delanteras/traseras, asientos, tapices, tablero y elementos de seguridad accesibles. Contrastar desgaste con kilometraje y datos del escáner.",
          evidencia: "Fotos de daño y registro de coherencia.",
          escalamiento: "Duda de desgaste/identidad o seguridad: documentar y escalar sin asumir la causa.",
        },
        {
          n: "6.02",
          queRevisar: "Probar limpiaparabrisas, plumillas, lanzaaguas y claxon. Identificar la función afectada; registrar evidencia y demérito según STD.",
          controlCompleto: "Probar comando y accionamiento de plumillas, jet lanzaaguas y claxon. Registrar la función afectada si hay desvío.",
          evidencia: "Resultado; foto/video si hay falla.",
          escalamiento: "Falla funcional: demeritar según STD y describirla sin generalizar.",
        },
        {
          n: "6.03",
          queRevisar: "Probar A/C y calefacción; medir con termómetro según método vigente. Registrar temperatura y condiciones; escalar resultados no concluyentes.",
          controlCompleto: "Comprobar funcionamiento y registrar temperatura con termómetro según método vigente. Indicar condiciones de la prueba.",
          evidencia: "Lectura del termómetro y registro funcional.",
          escalamiento: "Fuera de STD o prueba no concluyente: demeritar/escalar según corresponda.",
        },
        {
          n: "6.04",
          queRevisar: "Probar pantalla, audio y cámara/sensores de estacionamiento si equipa. Registrar función y síntoma; no equivale a validar ADAS.",
          controlCompleto: "Probar pantalla/audio y la función de cámara/sensores de estacionamiento cuando equipe. Registrar componente y síntoma observado.",
          evidencia: "Resultado; foto/video si falla.",
          escalamiento: "Falla: demeritar/escalar según STD. No confundir esta prueba con validación ADAS.",
        },
        {
          n: "6.05",
          queRevisar: "Probar ventanas y espejos desde sus botoneras; revisar ajustes de habitáculo equipados. Registrar ubicación/función de cada falla.",
          controlCompleto: "Probar los comandos de ventanas y espejos desde las botoneras disponibles; revisar los ajustes de habitáculo que equipe y registrar fallas por función.",
          evidencia: "Registro por función; foto/video si falla.",
          escalamiento: "No generalizar como OK si un comando falla; describir función/ubicación.",
        },
        {
          n: "6.06",
          queRevisar: "Revisar soplador, compuertas, desempañador y confort equipado, incluidos asientos eléctricos. Distinguir falla de ausencia de equipamiento.",
          controlCompleto: "Revisar soplador, compuertas, desempañador y funciones de confort equipadas, incluidos asientos eléctricos. Distinguir falta de función de diferencia de equipamiento.",
          evidencia: "Registro por función/condición; evidencia de falla.",
          escalamiento: "Falla: aplicar STD. No registrar N/A solo por falta de tiempo o acceso.",
        },
        {
          n: "6.07",
          queRevisar: "Cruzar funciones de climatización/confort con diagnóstico electrónico ante anomalías. Registrar intermitencias y escalar diferencias.",
          controlCompleto: "Relacionar la prueba funcional de climatización/confort con su diagnóstico electrónico cuando exista anomalía. Registrar funciones sin respuesta o intermitentes.",
          evidencia: "Prueba funcional y lectura asociada si disponible.",
          escalamiento: "Diferencia entre función y diagnóstico: escalar; no marcar todo el sistema OK.",
        },
      ],
    },
    {
      grupo: "7 | Estética exterior y repuestos exteriores",
      items: [
        {
          n: "7.01",
          queRevisar: "Recorrer exterior; revisar chapa, pintura y reparaciones. Fotografiar por panel/ubicación. Sospecha estructural: volver al grupo 4 y escalar.",
          controlCompleto: "Recorrer el exterior y revisar daños de chapa/pintura y reparaciones visibles. Documentar panel y ubicación; ampliar si aparece sospecha.",
          evidencia: "Fotos por panel con hallazgo; set según STD.",
          escalamiento: "Daño estético: demeritar. Sospecha estructural: volver a grupo 4 y escalar.",
        },
        {
          n: "7.02",
          queRevisar: "Revisar cristales, ópticos, espejos y piezas exteriores. Fotografiar roturas, reparaciones y faltantes; aplicar STD para reparar/reemplazar.",
          controlCompleto: "Revisar condición física de cristales, ópticos, espejos y piezas exteriores. Identificar roturas, reparaciones y faltantes por ubicación.",
          evidencia: "Foto del componente y detalle del daño.",
          escalamiento: "Aplicar STD para reparar/reemplazar. La prueba de iluminación queda en grupo 3.",
        },
        {
          n: "7.03",
          queRevisar: "Registrar reparaciones y pintura por panel; medir si método/equipo lo permiten. Cruzar con estructura sin duplicar deméritos ni concluir por un valor.",
          controlCompleto: "Ampliar el registro exterior por panel; contrastar señales de repintado con mediciones cuando el método/equipo lo permitan. Relacionar con grupo 4 sin duplicar deméritos.",
          evidencia: "Mapa por panel y mediciones identificadas.",
          escalamiento: "Medición aislada no define daño estructural; validar indicios y aplicar STD.",
        },
      ],
    },
    {
      grupo: "8 | Control técnico y cierre",
      items: [
        {
          n: "8.01",
          queRevisar: "Validar descripción, categoría, ubicación, evidencia y monto interno de cada hallazgo. Evitar duplicados; NO OK no siempre implica demérito.",
          controlCompleto: "Verificar hallazgo, descripción, categoría, ubicación y monto en el demeritador vigente. Evitar duplicados y corregir inconsistencias antes del envío.",
          evidencia: "Demérito y evidencia asociados.",
          escalamiento: "NO OK no equivale siempre a demérito: diferenciar recotización, validación o rechazo.",
        },
        {
          n: "8.02",
          queRevisar: "Verificar registro de repuesto, herramientas, llaves, funciones y detalles; corregir faltantes o duplicados antes del cierre.",
          controlCompleto: "Revisar que repuesto, herramientas, llaves, funciones y detalles observados estén registrados sin duplicados ni omisiones antes del cierre.",
          evidencia: "Listado conciliado con deméritos.",
          escalamiento: "Faltante o hallazgo sin registro: corregir antes de finalizar.",
        },
        {
          n: "8.03",
          queRevisar: "Cruzar dinámica, revisión visual, escáner y evidencia. Separar falla confirmada de diagnóstico pendiente; corregir o escalar incoherencias.",
          controlCompleto: "Conciliar prueba dinámica, inspección visual, escáner y evidencia. Diferenciar componente confirmado de diagnóstico pendiente; evitar atribuciones sin respaldo.",
          evidencia: "Síntesis técnica vinculada a hallazgos.",
          escalamiento: "Conclusión inconsistente o duda no resuelta: corregir/escalar antes de cerrar.",
        },
        {
          n: "8.04",
          queRevisar: "Consolidar trabajos y contrastar envergadura con política. Validar costo/tiempo cuando corresponda; no aprobar un posible exceso sin validación.",
          controlCompleto: "Consolidar hallazgos y trabajos necesarios para evaluar su envergadura frente a la política vigente. Solicitar validación de costo/tiempo cuando corresponda.",
          evidencia: "Resumen de trabajos y validación correspondiente.",
          escalamiento: "Posible exceso de política: no aprobar sin validación; no inventar límites de costo.",
        },
        {
          n: "8.05",
          queRevisar: "Ante riesgo crítico, presentar hallazgos/evidencia/limitaciones a TMS/TT&DJ y registrar decisión. Sin caso crítico, N/A con motivo.",
          controlCompleto: "Presentar hallazgos críticos, evidencia, diagnóstico y limitaciones a TMS/TT&DJ. Registrar respuesta y decisión; si no existe caso crítico, justificar N/A.",
          evidencia: "Hilo/validación y responsable de la decisión.",
          escalamiento: "Riesgo crítico sin resolver: no aprobar. Una validación no anula un rechazo obligatorio.",
        },
        {
          n: "8.06",
          queRevisar: "Consolidar ocho grupos, riesgos, pruebas no hechas y pendientes. Obtener revisión final de TL/TMS; no aprobar con riesgos críticos pendientes.",
          controlCompleto: "Consolidar resultado de los ocho grupos, riesgos residuales, pruebas no realizadas y condiciones pendientes. Presentar la síntesis a TL/TMS para revisión final.",
          evidencia: "Síntesis, revisión identificada y decisión.",
          escalamiento: "No aprobar con riesgos/limitaciones críticas pendientes ni excepciones a rechazo obligatorio.",
        },
        {
          n: "8.07",
          queRevisar: "Revisar los ocho grupos, limitaciones y validaciones. Registrar conclusión según STD; IQI o porcentaje no aprueban por sí solos.",
          controlCompleto: "Revisar los ocho grupos, límites de inspección y validaciones pendientes. Registrar si la unidad puede continuar según STD; el IQI no aprueba por sí solo.",
          evidencia: "Conclusión técnica y decisión registrada.",
          escalamiento: "Duda crítica o criterio de rechazo: escalar/aplicar STD; no forzar aprobación.",
        },
        {
          n: "8.08",
          queRevisar: "Subir evidencia identificable cuanto antes; conciliar datos/deméritos y cerrar FlowBuilder/Slack. No finalizar con información pendiente.",
          controlCompleto: "Cargar evidencia identificable lo antes posible; comprobar coherencia con deméritos y datos actualizados. Enviar FlowBuilder y cerrar el hilo según flujo.",
          evidencia: "Enlace/registro de evidencia y cierre.",
          escalamiento: "Datos, evidencia o recotización pendientes: no finalizar con información incompleta.",
        },
        {
          n: "8.09",
          queRevisar: "Estacionar; explicar resultado, estado y deméritos según STD. Resolver dudas e indicar espera. No dar valores: oferta a cargo de Onboarder Supply.",
          controlCompleto: "Estacionar en zona indicada. Explicar resultado, estado general y deméritos según STD; resolver dudas y orientar la espera. La oferta la presenta Onboarder Supply.",
          evidencia: "Resultado comunicado y continuidad registrada.",
          escalamiento: "No informar valores al cliente ni prometer oferta. Duda técnica: aclarar antes de derivar.",
        },
        {
          n: "8.10",
          queRevisar: "Ante hallazgo relevante/recurrente, registrar aprendizaje y propuesta para KJI/STD/alerta. Sin caso aplicable, N/A con motivo; validar criterios nuevos.",
          controlCompleto: "Cuando exista un hallazgo relevante o recurrente, registrar aprendizaje y propuesta de refuerzo de KJI/STD/alerta. Sin aprendizaje aplicable, indicar N/A con motivo.",
          evidencia: "Registro de mejora o justificación de N/A.",
          escalamiento: "No publicar un nuevo criterio sin validación del responsable del estándar.",
        },
      ],
    },
  ],
};

export const PROTOCOLOS: Record<Grado, Protocolo> = { A, B, C, D, E };

/** Devuelve el protocolo del grado IQI; cae a 'C' si el grado es raro. */
export function protocoloPorIqi(grado: string | null | undefined): Protocolo {
  const g = (grado ?? "").toUpperCase().trim();
  return (PROTOCOLOS as Record<string, Protocolo>)[g] ?? PROTOCOLOS.C;
}

/** Total de puntos de control de un protocolo (todos los grupos). */
export function totalItems(p: Protocolo): number {
  return p.grupos.reduce((acc, g) => acc + g.items.length, 0);
}


// ============================================================
// Protocolo HÍBRIDO / ELÉCTRICO — fijo, NO depende del IQI.
// Fuente: hoja "KJI · INSPECCIÓN VH ELÉCTRICO / HÍBRIDO — REV 01"
// (marcada "NO MODIFICAR"). Aplica a BEV (100% eléctrico), HEV y PHEV.
// En la UI se muestra en una pestaña aparte; el usuario la abre cuando
// el vehículo es híbrido/eléctrico.
// ============================================================

export type EtapaHibrido = {
  n: number;
  grupo: string; // PASO GRAL: Recepción, Seguridad AV, Eléctrico AV, ...
  secuencia: string;
  /** Texto del link/instructivo de la hoja, si tiene. */
  link?: string;
};

export type ProtocoloHibrido = {
  codigo: string;
  nombre: string;
  rev: string;
  aplicaA: string;
  escalaDemeritos: string;
  etapas: EtapaHibrido[];
};

export const PROTOCOLO_HIBRIDO: ProtocoloHibrido = {
  codigo: "KJI · VH Eléctrico / Híbrido",
  nombre: "Inspección VH Eléctrico / Híbrido",
  rev: "REV 01",
  aplicaA:
    "Vehículos BEV (100% eléctrico), HEV y PHEV (híbridos). Estándar final de inspección pre-compra.",
  escalaDemeritos:
    "0 = OK (sin demérito) · 1 = Demérito menor (reparar/negociar) · 3 = Falla crítica (rechazar salvo garantía vigente)",
  etapas: [
    {
      n: 1,
      grupo: "Recepción",
      secuencia:
        "Recepción del VH: identificar tecnología (BEV / HEV / PHEV), VIN, y consultar recalls / campañas de seguridad de batería del fabricante.",
    },
    {
      n: 2,
      grupo: "Seguridad AV",
      secuencia:
        "Seguridad de Alto Voltaje (AV): colocar EPP (guantes dieléctricos Clase 0), identificar cables y conectores NARANJAS y verificar integridad del sistema AV. NO abrir la carcasa de batería ni tocar cables naranjas sin certificación AV.",
      link: "Ver: AV - Seguridad Alto Voltaje",
    },
    {
      n: 3,
      grupo: "Eléctrico AV",
      secuencia:
        "Revisión de la batería auxiliar de 12V: voltaje en reposo (12,6–12,8V), prueba de carga (load test) y estado de bornes.",
      link: "Ver: AV - Carga y Batería 12V",
    },
    {
      n: 4,
      grupo: "Eléctrico AV",
      secuencia:
        "Diagnóstico por escáner: ODO check + lectura de TODOS los módulos y DTC (incluidos los de alto voltaje), versión de software / actualizaciones OTA.",
      link: "Ver: AV - Escaneo y DTC HV · Códigos de Falla Críticos",
    },
    {
      n: 5,
      grupo: "Eléctrico AV",
      secuencia:
        "Medición del Estado de Salud (SOH) de la batería de tracción de alto voltaje con scanner / herramienta específica (NO usar la autonomía del tablero).",
      link: "Ver: AV - Estado de Batería (SOH)",
    },
    {
      n: 6,
      grupo: "Eléctrico AV",
      secuencia:
        "Sistema de carga: inspección del puerto AC/DC (pines, sello, clip), cable / EVSE y prueba de carga real en Nivel 2 (y DC si está disponible).",
      link: "Ver: AV - Carga y Batería 12V",
    },
    {
      n: 7,
      grupo: "Eléctrico AV",
      secuencia:
        "Gestión térmica: nivel y estado del refrigerante de batería e inversor, operación de bombas y ventiladores, y búsqueda de fugas.",
      link: "Ver: AV - Gestión Térmica",
    },
    {
      n: 8,
      grupo: "Frenos + Rodado",
      secuencia:
        "Frenos y frenado regenerativo: espesor de discos/pastillas, corrosión de discos (por bajo uso), cáliper pegado, estado y humedad del líquido de frenos.",
      link: "Ver: AV - Frenado Regenerativo",
    },
    {
      n: 9,
      grupo: "Frenos + Rodado",
      secuencia:
        "Neumáticos y suspensión: desgaste (mayor peso del EV), alineación, índice de carga adecuado (XL/HL/EV), y componentes de suspensión por sobrecarga.",
    },
    {
      n: 10,
      grupo: "Estructura",
      secuencia:
        "Carrocería e intrusión de agua: revisar daño / reparaciones en la zona de la batería AV y evidencia de inundación (óxido, humedad, olor) cerca de componentes AV.",
    },
    {
      n: 11,
      grupo: "Combustión (HEV/PHEV)",
      secuencia:
        "Solo híbridos: revisión del motor a combustión, transición suave entre modos eléctrico↔combustión, motor-generador e inversor. En PHEV, prueba de carga por enchufe.",
      link: "Ver: AV - Motor Combustión y Modos",
    },
    {
      n: 12,
      grupo: "Doc. / ADM",
      secuencia:
        "Documentación: fecha de puesta en servicio, historial de la batería (reemplazos), garantía remanente de batería y campañas de seguridad cerradas.",
    },
    {
      n: 13,
      grupo: "Prueba Dinámica",
      secuencia:
        "Prueba de manejo EV/híbrido: ruidos del tren motriz eléctrico, aceleración lineal, funcionamiento de la regeneración, cambio de modos (HEV) y autonomía real vs estimada.",
      link: "Ver: AV - Pruebas Dinámicas · Prueba de Manejo",
    },
    {
      n: 14,
      grupo: "FIN",
      secuencia:
        "Consolidación de deméritos (escala 0 / 1 / 3) y decisión final del vehículo: Aprobar (C2B / Approved) · Reparar (FTQ+) · Rechazar (No apto).",
    },
  ],
};

function credenciales_() {
  var p = PropertiesService.getScriptProperties();
  return {
    url: p.getProperty('SUPABASE_URL'),
    key: p.getProperty('SUPABASE_SERVICE_KEY')
  };
}

function supabaseRequest_(method, path, body, headersExtra) {
  var c = credenciales_();
  var options = {
    method: method,
    contentType: 'application/json',
    headers: Object.assign({
      apikey: c.key,
      Authorization: 'Bearer ' + c.key
    }, headersExtra || {}),
    muteHttpExceptions: true
  };
  if (body) options.payload = JSON.stringify(body);
  var resp = UrlFetchApp.fetch(c.url + '/rest/v1/' + path, options);
  if (resp.getResponseCode() >= 300) {
    throw new Error('Supabase ' + resp.getResponseCode() + ': ' + resp.getContentText());
  }
  return resp;
}

function insertarEnBloques_(tabla, filas) {
  var TAMANIO = 500;
  for (var i = 0; i < filas.length; i += TAMANIO) {
    supabaseRequest_('POST', tabla, filas.slice(i, i + TAMANIO), { Prefer: 'return=minimal' });
  }
}

function leerHoja_(nombreHoja) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  var datos = sh.getDataRange().getValues();
  var headers = datos[0].map(function (h) { return String(h).trim(); });
  // getDataRange() suele traer filas de más (formato/bordes aplicados más
  // allá de los datos reales). Se descartan las filas totalmente vacías.
  var filas = datos.slice(1).filter(function (fila) {
    return fila.some(function (v) { return v !== '' && v !== null && v !== undefined; });
  });
  return { headers: headers, filas: filas };
}

function mapearFila_(headers, fila, mapeo) {
  var obj = {};
  for (var colDestino in mapeo) {
    var idx = headers.indexOf(mapeo[colDestino]);
    if (idx === -1) continue;
    var valor = fila[idx];
    obj[colDestino] = (valor === '' || valor === undefined) ? null : valor;
  }
  return obj;
}

// ── Mapeos: columna destino en Supabase -> header exacto en la sheet ──
var MAPEO_CATALOGO = {
  sku: 'sku', old_sku: 'old_sku', marca: 'marca', modelo: 'modelo', version: 'version',
  anio: 'año', transmision: 'transmision', combustible: 'combustible',
  aux_sku: 'Aux_SKU', bodytype: 'bodytype', doors: 'doors', traccion: 'traccion'
};
var MAPEO_INSPDIF = {
  sku: 'sku', aux_sku: 'Aux', version_corta: 'version_corta',
  kms_inspe_plus: 'kms_inspe_plus', link: 'Link'
};
var MAPEO_ALERTAS = { motor: 'Motor', link: 'Link' };
// IQI por marca — hoja "CL - KAOS BBDD - IQI". El grado A-E ya viene
// calculado en la hoja; acá solo se sincroniza tal cual. El código
// no lo recalcula (lib/iqi.ts lo lee vía RPC grado_iqi_marca).
var MAPEO_IQI_MARCA = { marca: 'Marcas', grado: 'IQI FINAL MARCA' };
var MAPEO_OTS = {
  stock_id: 'stock_id', workshop_name: 'workshop_name', work_item_name: 'work_item_name',
  km: 'KM', aux_sku: 'Aux_SKU', match_old_sku: 'match_old_sku', sku: 'SKU'
};
var MAPEO_CANGREJOS = {
  stock_id: 'stock_id_final', patente: 'dominio_final', km: 'km_final',
  aux_sku: 'Aux_SKU', match_old_sku: 'match_old_sku', sku: 'SKU'
};
var MAPEO_DEVOLUCIONES = {
  patente: 'PATENTE', descripcion: 'DESCRIPCION DE LA DEVOLUCION',
  aux_sku: 'Aux_SKU', match_old_sku: 'match_old_sku', sku: 'SKU'
};
// Inventario completo (fuente: "CL - KAOS BBDD - ERP.csv"). Sin
// aux_sku: en Supabase es una columna generada (marca-modelo-version-
// año), no se manda desde acá. Headers según el CSV; si en el Sheet
// la pestaña usa otros nombres de columna, ajustar los valores.
var MAPEO_STOCK = {
  stock_id: 'stock_id_final', marca: 'marca_final', modelo: 'modelo_final',
  anio: 'year_final', version: 'version', km: 'km_final', patente: 'dominio_final',
  inventory_status: 'inventory_status', motivo: 'MOTIVO', sku: 'sku_final',
  bucket_stock_tracker: 'bucket_stock_tracker'
};

// ── Filtros: la hoja "Cangrejos" trae el stock completo (~22.717 filas)
// con una columna MOTIVO que solo dice "CANGREJO" en los casos reales.
// Sin este filtro se sincronizaban TODAS las filas, no solo esas ~123. ──
function filtroCangrejo_(headers, fila) {
  var idx = headers.indexOf('MOTIVO');
  return idx !== -1 && String(fila[idx]).trim().toUpperCase() === 'CANGREJO';
}

function syncReemplazoCompleto_(nombreHoja, tabla, mapeo, filtro) {
  var hoja = leerHoja_(nombreHoja);
  var filasHoja = filtro
    ? hoja.filas.filter(function (f) { return filtro(hoja.headers, f); })
    : hoja.filas;
  var filas = filasHoja.map(function (f) { return mapearFila_(hoja.headers, f, mapeo); });
  supabaseRequest_('DELETE', tabla + '?id=gt.0', null);
  insertarEnBloques_(tabla, filas);
  Logger.log(tabla + ': ' + filas.length + ' filas (reemplazo completo)');
}

function syncIncremental_(nombreHoja, tabla, mapeo) {
  var props = PropertiesService.getScriptProperties();
  var key = 'ultimaFila_' + tabla;
  var ultimaFila = parseInt(props.getProperty(key) || '0');

  var hoja = leerHoja_(nombreHoja);
  var filasNuevas = hoja.filas.slice(ultimaFila);
  if (filasNuevas.length === 0) {
    Logger.log(tabla + ': sin filas nuevas');
    return;
  }
  var filas = filasNuevas.map(function (f) { return mapearFila_(hoja.headers, f, mapeo); });
  insertarEnBloques_(tabla, filas);
  props.setProperty(key, String(hoja.filas.length));
  Logger.log(tabla + ': ' + filas.length + ' filas nuevas');
}

// ── Entry points para los triggers ──
function sincronizarMaestros() {
  syncReemplazoCompleto_('Catalogo_Activo', 'catalogo', MAPEO_CATALOGO);
  syncReemplazoCompleto_('InspDif', 'insp_dif', MAPEO_INSPDIF);
  syncReemplazoCompleto_('ALERTAS', 'alertas_motor', MAPEO_ALERTAS);
  // Nombre de pestaña asumido "IQI" — ajustar si en el Sheet se llama
  // distinto. Reemplazo completo: esta base se va actualizando.
  syncReemplazoCompleto_('IQI', 'iqi_marca', MAPEO_IQI_MARCA);
  syncReemplazoCompleto_('Cangrejos', 'cangrejos', MAPEO_CANGREJOS, filtroCangrejo_);
  // Devoluciones: se pasó a reemplazo completo para que la tabla se
  // autocorrija en cada sync (con incremental, cualquier fila mala
  // sincronizada una vez quedaba pegada para siempre). Si la hoja
  // "Devs_Proceso/Insp" tiene también una columna de filtro tipo
  // MOTIVO/ESTADO que hoy no se está respetando, hay que agregarle
  // un filtro igual que filtroCangrejo_.
  syncReemplazoCompleto_('Devs_Proceso/Insp', 'devoluciones', MAPEO_DEVOLUCIONES);
  // Nombre de pestaña asumido como "ERP" (por el nombre del CSV
  // descargado) — cambiar el primer argumento si en el Sheet se
  // llama distinto.
  syncReemplazoCompleto_('ERP', 'stock', MAPEO_STOCK);
}

function sincronizarIncrementales() {
  // Único log genuinamente append-only; el resto pasó a reemplazo completo.
  syncIncremental_('OTs', 'ots', MAPEO_OTS);
}

// Sube SOLO la hoja IQI a la tabla iqi_marca (reemplazo completo).
// Útil para correr suelto cuando se actualiza la base de IQI sin
// tener que re-sincronizar todos los maestros.
function sincronizarIqi() {
  syncReemplazoCompleto_('IQI', 'iqi_marca', MAPEO_IQI_MARCA);
}

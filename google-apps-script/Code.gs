/**
 * menulima.pe — Backend de datos sobre Google Sheets.
 * Un solo Web App (doGet/doPost) con acciones por parámetro `action`,
 * mismo patrón que se usa en mercadodecafe.com.
 *
 * Despliegue: Extensiones → Apps Script → pega este archivo → Implementar →
 * Nueva implementación → tipo "Aplicación web" → Ejecutar como "Yo" →
 * Quién tiene acceso "Cualquier usuario". Copia la URL /exec resultante en
 * GOOGLE_SHEETS_WEBAPP_URL (Netlify env vars). Ver SETUP.md para el detalle
 * de pestañas y columnas.
 */

// CAMBIA este token por uno propio y ponlo también en GOOGLE_SHEETS_ADMIN_TOKEN (Netlify).
const ADMIN_TOKEN = "menulima_admin_CAMBIA_ESTE_TOKEN";

const SHEET_PRECIOS = "Precios";
const SHEET_PEDIDOS = "Pedidos";
const SHEET_USUARIOS = "Usuarios";
const SHEET_RAPPI_LOG = "RappiCargoLog";

const PRECIOS_HEADERS = ["key", "nombre", "categoria", "precioBase"];
const PEDIDOS_HEADERS = [
  "orderId", "fecha", "hora", "emailCliente", "nombre", "telefono", "canal", "tipo",
  "itemsJson", "subtotal", "flete", "total", "direccion", "referencia", "preventa",
  "fechaEntrega", "metodoPago", "estado", "rappiCargoId", "operacionYape",
  "comprobanteTipo", "comprobanteDatos", "creadoEn", "actualizadoEn",
];
const USUARIOS_HEADERS = ["email", "nombre", "telefono", "direccionesJson", "datosFacturacionJson", "creadoEn"];
const RAPPI_LOG_HEADERS = ["orderId", "requestJson", "responseJson", "fecha"];

// Precio de menú + toda la carta. IMPORTANTE: estas keys deben coincidir
// exactamente con las que genera src/lib/cartaData.ts (slugify de cada
// plato) -- si agregas/cambias platos allá, refleja el cambio aquí.
const DEFAULT_PRICES = [
  ["menu", "Menú del día", "menu", 22],
  ["comida_criolla_carnes__apanado", "Apanado", "comida_criolla_carnes", 24],
  ["comida_criolla_carnes__apanado-encebollado", "Apanado encebollado", "comida_criolla_carnes", 26],
  ["comida_criolla_carnes__milanesa", "Milanesa", "comida_criolla_carnes", 24],
  ["comida_criolla_carnes__pechuga-a-la-plancha", "Pechuga a la plancha", "comida_criolla_carnes", 22],
  ["comida_criolla_carnes__pollo-al-oregano", "Pollo al orégano", "comida_criolla_carnes", 24],
  ["comida_criolla_carnes__bistec", "Bistec", "comida_criolla_carnes", 24],
  ["comida_criolla_carnes__bistec-encebollado", "Bistec encebollado", "comida_criolla_carnes", 26],
  ["comida_criolla_carnes__lomo-saltado", "Lomo saltado", "comida_criolla_carnes", 26],
  ["comida_criolla_carnes__taipa-de-verduras", "Taipa de verduras", "comida_criolla_carnes", 24],
  ["comida_criolla_carnes__arroz-chaufa", "Arroz chaufa", "comida_criolla_carnes", 20],
  ["comida_criolla_carnes__tallarin-saltado", "Tallarín saltado", "comida_criolla_carnes", 22],
  ["pescados_mariscos__pescado-a-lo-macho", "Pescado a lo macho", "pescados_mariscos", 38],
  ["pescados_mariscos__sudado-de-pescado", "Sudado de pescado", "pescados_mariscos", 36],
  ["pescados_mariscos__apanado-de-pescado", "Apanado de pescado", "pescados_mariscos", 32],
  ["pescados_mariscos__apanado-de-pescado-encebollado", "Apanado de pescado encebollado", "pescados_mariscos", 34],
  ["pescados_mariscos__taipa-mixto", "Taipa mixto", "pescados_mariscos", 38],
  ["pescados_mariscos__chicharron-de-pescado", "Chicharrón de pescado", "pescados_mariscos", 32],
  ["pescados_mariscos__pescado-frito", "Pescado frito", "pescados_mariscos", 32],
  ["pescados_mariscos__pescado-frito-encebollado", "Pescado frito encebollado", "pescados_mariscos", 34],
  ["pescados_mariscos__milanesa-de-pescado", "Milanesa de pescado", "pescados_mariscos", 32],
  ["sopas__chupe-de-pescado", "Chupe de pescado", "sopas", 26],
  ["sopas__sopa-a-la-criolla-o-minuta", "Sopa a la criolla o minuta", "sopas", 20],
  ["sopas__sustancia", "Sustancia", "sopas", 18],
  ["sopas__dieta-de-pollo", "Dieta de pollo", "sopas", 16],
  ["guarniciones__arroz-gohan", "Arroz (gohan)", "guarniciones", 5],
  ["guarniciones__ensalada", "Ensalada", "guarniciones", 5],
  ["guarniciones__papas-fritas", "Papas fritas", "guarniciones", 8],
  ["bebidas__gaseosa-coca-cola-inca-kola", "Gaseosa (Coca-Cola / Inca Kola)", "bebidas", 5],
  ["bebidas__agua-san-luis", "Agua (San Luis)", "bebidas", 4],
  ["bebidas__aloe-vera-300-ml", "Aloe Vera 300 ml.", "bebidas", 8],
  ["bebidas__jarra-de-limonada-naranjada", "Jarra de limonada / naranjada", "bebidas", 20],
  ["bebidas__cerveza-pilsen-305-ml", "Cerveza Pilsen 305 ml.", "bebidas", 10],
  ["bebidas__cerveza-japonesa-asahi-sapporo", "Cerveza japonesa (Asahi / Sapporo)", "bebidas", 20],
  ["bebidas__tetera-de-ocha", "Tetera de ocha", "bebidas", 18],
];

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
}

function findRowIndexByKey_(sheet, keyColumnName, keyValue) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const col = headers.indexOf(keyColumnName);
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][col]) === String(keyValue)) return i + 1; // 1-indexed, +1 por header
  }
  return -1;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function requireToken_(params) {
  return params.token === ADMIN_TOKEN;
}

function ensurePricesSeeded_() {
  const sheet = getOrCreateSheet_(SHEET_PRECIOS, PRECIOS_HEADERS);
  if (sheet.getLastRow() < 2) {
    DEFAULT_PRICES.forEach((row) => sheet.appendRow(row));
  }
  return sheet;
}

// ── Acciones ────────────────────────────────────────────────────────────

function actionPrices_() {
  const sheet = ensurePricesSeeded_();
  const rows = sheetToObjects_(sheet).map((r) => ({
    key: r.key,
    nombre: r.nombre,
    categoria: r.categoria,
    precioBase: Number(r.precioBase),
  }));
  return jsonOut_({ prices: rows });
}

function actionSetPrice_(params) {
  if (!requireToken_(params)) return jsonOut_({ error: "No autorizado" });
  const sheet = ensurePricesSeeded_();
  const idx = findRowIndexByKey_(sheet, "key", params.key);
  const precio = Number(params.precio);
  if (idx === -1) {
    sheet.appendRow([params.key, params.key, "", precio]);
  } else {
    const col = PRECIOS_HEADERS.indexOf("precioBase") + 1;
    sheet.getRange(idx, col).setValue(precio);
  }
  return jsonOut_({ ok: true });
}

function actionCreateOrder_(payload) {
  const sheet = getOrCreateSheet_(SHEET_PEDIDOS, PEDIDOS_HEADERS);
  const row = PEDIDOS_HEADERS.map((h) => {
    if (h === "itemsJson") return JSON.stringify(payload.items || []);
    if (h === "comprobanteDatos") return payload.comprobanteDatos || "";
    return payload[h] !== undefined ? payload[h] : "";
  });
  sheet.appendRow(row);
  return jsonOut_({ orderId: payload.orderId });
}

function orderRowToObject_(row) {
  const obj = {};
  PEDIDOS_HEADERS.forEach((h) => (obj[h] = row[h]));
  obj.items = JSON.parse(row.itemsJson || "[]");
  obj.subtotal = Number(row.subtotal);
  obj.flete = Number(row.flete);
  obj.total = Number(row.total);
  obj.preventa = String(row.preventa) === "true";
  delete obj.itemsJson;
  return obj;
}

function actionGetOrder_(params) {
  const sheet = getOrCreateSheet_(SHEET_PEDIDOS, PEDIDOS_HEADERS);
  const rows = sheetToObjects_(sheet);
  const found = rows.find((r) => String(r.orderId) === String(params.orderId));
  return jsonOut_({ order: found ? orderRowToObject_(found) : null });
}

function actionGetOrdersByEmail_(params) {
  const sheet = getOrCreateSheet_(SHEET_PEDIDOS, PEDIDOS_HEADERS);
  const rows = sheetToObjects_(sheet).filter((r) => r.emailCliente === params.email);
  return jsonOut_({ orders: rows.map(orderRowToObject_) });
}

function actionOrdersByStatus_(params) {
  if (!requireToken_(params)) return jsonOut_({ error: "No autorizado" });
  const sheet = getOrCreateSheet_(SHEET_PEDIDOS, PEDIDOS_HEADERS);
  const rows = sheetToObjects_(sheet).filter((r) => r.estado === params.estado);
  return jsonOut_({ orders: rows.map(orderRowToObject_) });
}

function actionUpdateOrderStatus_(params) {
  if (!requireToken_(params)) return jsonOut_({ error: "No autorizado" });
  const sheet = getOrCreateSheet_(SHEET_PEDIDOS, PEDIDOS_HEADERS);
  const idx = findRowIndexByKey_(sheet, "orderId", params.orderId);
  if (idx === -1) return jsonOut_({ error: "Pedido no encontrado" });

  sheet.getRange(idx, PEDIDOS_HEADERS.indexOf("estado") + 1).setValue(params.estado);
  if (params.rappiCargoId) {
    sheet.getRange(idx, PEDIDOS_HEADERS.indexOf("rappiCargoId") + 1).setValue(params.rappiCargoId);
  }
  if (params.operacionYape) {
    sheet.getRange(idx, PEDIDOS_HEADERS.indexOf("operacionYape") + 1).setValue(params.operacionYape);
  }
  sheet.getRange(idx, PEDIDOS_HEADERS.indexOf("actualizadoEn") + 1).setValue(new Date().toISOString());
  return jsonOut_({ ok: true });
}

function actionSaveProfile_(payload) {
  const sheet = getOrCreateSheet_(SHEET_USUARIOS, USUARIOS_HEADERS);
  const idx = findRowIndexByKey_(sheet, "email", payload.email);
  if (idx === -1) {
    sheet.appendRow([
      payload.email,
      payload.nombre || "",
      payload.telefono || "",
      payload.direccionesJson || "[]",
      payload.datosFacturacionJson || "{}",
      new Date().toISOString(),
    ]);
  } else {
    if (payload.nombre !== undefined) sheet.getRange(idx, USUARIOS_HEADERS.indexOf("nombre") + 1).setValue(payload.nombre);
    if (payload.telefono !== undefined) sheet.getRange(idx, USUARIOS_HEADERS.indexOf("telefono") + 1).setValue(payload.telefono);
    if (payload.direccionesJson !== undefined) sheet.getRange(idx, USUARIOS_HEADERS.indexOf("direccionesJson") + 1).setValue(payload.direccionesJson);
    if (payload.datosFacturacionJson !== undefined) sheet.getRange(idx, USUARIOS_HEADERS.indexOf("datosFacturacionJson") + 1).setValue(payload.datosFacturacionJson);
  }
  return jsonOut_({ ok: true });
}

function actionGetProfile_(params) {
  const sheet = getOrCreateSheet_(SHEET_USUARIOS, USUARIOS_HEADERS);
  const rows = sheetToObjects_(sheet);
  const found = rows.find((r) => r.email === params.email);
  return jsonOut_({ profile: found || null });
}

function actionSalesToday_(params) {
  if (!requireToken_(params)) return jsonOut_({ error: "No autorizado" });
  const sheet = getOrCreateSheet_(SHEET_PEDIDOS, PEDIDOS_HEADERS);
  const hoy = Utilities.formatDate(new Date(), "America/Lima", "yyyy-MM-dd");
  const rows = sheetToObjects_(sheet).filter(
    (r) => r.fecha === hoy && r.estado !== "cancelado" && r.estado !== "pendiente_pago"
  );
  const pedidos = rows.map(orderRowToObject_);
  const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
  return jsonOut_({ fecha: hoy, totalVentas, cantidadPedidos: pedidos.length, pedidos });
}

// ── Enrutamiento ────────────────────────────────────────────────────────

function doGet(e) {
  const params = e.parameter;
  switch (params.action) {
    case "prices": return actionPrices_();
    case "setprice": return actionSetPrice_(params);
    case "getOrder": return actionGetOrder_(params);
    case "getOrdersByEmail": return actionGetOrdersByEmail_(params);
    case "ordersByStatus": return actionOrdersByStatus_(params);
    case "updateOrderStatus": return actionUpdateOrderStatus_(params);
    case "getProfile": return actionGetProfile_(params);
    case "salesToday": return actionSalesToday_(params);
    default: return jsonOut_({ error: "Acción desconocida: " + params.action });
  }
}

function doPost(e) {
  const params = e.parameter;
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    payload = {};
  }

  switch (params.action) {
    case "createOrder": return actionCreateOrder_(payload);
    case "saveProfile": return actionSaveProfile_(payload);
    default: return jsonOut_({ error: "Acción desconocida: " + params.action });
  }
}

# Setup del backend de datos (Google Sheets + Apps Script)

## 1. Crea la hoja de cálculo

1. Crea una hoja de cálculo nueva en Google Sheets, nómbrala por ejemplo `menulima - datos`.
2. No necesitas crear las pestañas a mano: `Code.gs` las crea solas (`Precios`, `Pedidos`, `Usuarios`, `RappiCargoLog`) la primera vez que se les llama. Aun así, aquí está la referencia de columnas:

   - **Precios**: `key, nombre, categoria, precioBase`
   - **Pedidos**: `orderId, fecha, hora, emailCliente, nombre, telefono, canal, tipo, itemsJson, subtotal, flete, total, direccion, referencia, preventa, fechaEntrega, metodoPago, estado, rappiCargoId, operacionYape, comprobanteTipo, comprobanteDatos, creadoEn, actualizadoEn`
   - **Usuarios**: `email, nombre, telefono, direccionesJson, datosFacturacionJson, creadoEn`
   - **RappiCargoLog**: `orderId, requestJson, responseJson, fecha` (reservada para trazabilidad manual; el código actual no escribe aquí todavía — agrégalo si quieres auditoría persistente además de los logs de Netlify).

## 2. Pega el código

1. En la hoja: **Extensiones → Apps Script**.
2. Borra el contenido de `Code.gs` por defecto y pega el contenido de este `Code.gs`.
3. **Cambia la constante `ADMIN_TOKEN`** al inicio del archivo por un token propio, largo y aleatorio.

## 3. Despliega como Web App

1. **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Ejecutar como: **Yo** (tu cuenta).
4. Quién tiene acceso: **Cualquier usuario**.
5. Copia la URL que termina en `/exec`.

## 4. Conecta con Netlify

En las variables de entorno de Netlify (o tu `.env.local` para desarrollo):

```
GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/XXXXX/exec
GOOGLE_SHEETS_ADMIN_TOKEN=el-mismo-token-que-pusiste-en-ADMIN_TOKEN
```

## 5. Actualizaciones futuras

Cada vez que edites `Code.gs`, debes volver a **Implementar → Gestionar implementaciones → editar (lápiz) → Nueva versión → Implementar** para que los cambios entren en vigor en la URL `/exec` ya conectada (no genera una URL nueva si eliges "Nueva versión" sobre la implementación existente).

## Nota sobre `DEFAULT_PRICES`

Las keys de la carta (`comida_criolla_carnes__apanado`, etc.) deben coincidir exactamente con las que genera `src/lib/cartaData.ts` (función `slugify`). Si agregas o renombras platos en el código del sitio, refleja el mismo cambio en el arreglo `DEFAULT_PRICES` de `Code.gs` para que el backoffice los liste correctamente. Esto solo afecta la lista inicial sembrada en la pestaña Precios — el sitio siempre puede mostrar los precios base del código aunque la hoja esté vacía o desincronizada.

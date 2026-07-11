# menulima.pe

Ecommerce gastronómico (delivery + take away) para comida criolla, con menú
del día rotativo y carta completa. Next.js 14 (App Router) + TypeScript +
Tailwind CSS, pensado para desplegarse en Netlify.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- Lógica de servidor: Next.js Route Handlers (`src/app/api/**`), que Netlify
  convierte automáticamente en Serverless Functions vía `@netlify/plugin-nextjs`.
- Datos: Google Sheets + Google Apps Script (`google-apps-script/Code.gs`).
- Auth de clientes: Netlify Identity (GoTrue) vía REST directo, sin el widget oficial.
- Pagos: Izipay (tarjetas, API V4) + Yape (MVP de verificación manual).
- Logística: Rappi Cargo (módulo aislado, pendiente de credenciales de partner).

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa lo que ya tengas
npm run dev
```

Sin `GOOGLE_SHEETS_WEBAPP_URL` configurada, el sitio funciona igual: cae a un
almacén en memoria de solo-desarrollo (se anuncia por consola) para poder
probar el flujo de carrito → checkout → pedido de punta a punta.

## Checklist de credenciales pendientes

Nada de esto bloquea el desarrollo ni el deploy inicial — el sitio está
armado para activarse en cuanto agregues cada credencial:

- [ ] **Google Apps Script**: desplegar `google-apps-script/Code.gs` como Web App
      (ver `google-apps-script/SETUP.md`) y definir `GOOGLE_SHEETS_WEBAPP_URL` +
      `GOOGLE_SHEETS_ADMIN_TOKEN` en Netlify.
- [ ] **Netlify Identity**: activar "Identity" en el sitio de Netlify (Site
      settings → Identity → Enable Identity). Opcional: habilitar login con
      Google y registrar tu propia app OAuth si no quieres que la pantalla de
      consentimiento diga "netlify".
- [ ] **Izipay**: crear/afiliar una tienda propia para menulima.pe (distinta de
      cualquier otra tienda que ya operes) y definir `IZIPAY_SHOP_ID`,
      `IZIPAY_USERNAME`, `IZIPAY_PASSWORD`, `IZIPAY_PUBLIC_KEY`,
      `IZIPAY_HMAC_SHA256_KEY`. Verificar la URL del script del cliente
      (`NEXT_PUBLIC_IZIPAY_JS_URL`) y el formato exacto del IPN contra la
      documentación vigente de tu panel Mi Cuenta Web.
- [ ] **Yape Empresas**: mientras no haya convenio, el checkout usa el flujo
      manual (QR estático en `public/yape-qr.png` + verificación desde el
      backoffice). Sube tu QR real a esa ruta.
- [ ] **Rappi Cargo**: conseguir credenciales de partner en
      https://cargo.rappi.com.pe/home y definir `RAPPI_CARGO_BASE_URL`,
      `RAPPI_CARGO_API_KEY`, `RAPPI_CARGO_CLIENT_ID`, además de las
      coordenadas del local (`LOCAL_ORIGEN_*`). Ajustar el endpoint/payload
      exactos en `src/lib/rappiCargo.ts` según la documentación que entreguen.
- [ ] **Backoffice**: cambiar `ADMIN_SESSION_SECRET` por un secreto propio
      largo y aleatorio antes de ir a producción. Los usuarios/contraseñas
      hardcodeados (`ADMIN_USER_1/2`, `ADMIN_PASS_1/2`) también son
      reemplazables vía env vars sin tocar código.
- [ ] **WhatsApp**: definir `NEXT_PUBLIC_WHATSAPP_NUMBER` con el número real.

## Estructura relevante

- `src/lib/time.ts` — reloj de negocio: hora de Lima, ventana de compra de
  menú (11:30–15:00) y el algoritmo de rotación de semanas (anclaje real:
  10 de julio de 2026 = semana 3).
- `src/lib/menuAvailability.ts` — punto único de verdad de "qué menú se
  puede comprar ahora"; se usa tanto en la UI como en
  `/api/checkout/create-order`, que siempre revalida con la hora del
  servidor (nunca confía en el reloj del cliente).
- `src/lib/menuData.ts` / `src/lib/cartaData.ts` — data de negocio y reglas
  de precio (recargo de S/2.00 en la carta).
- `src/app/panel-mnl-3x9k` — backoffice oculto (no enlazado, `noindex`,
  `robots.txt` lo bloquea).

## Deploy en Netlify

1. Sube este proyecto a un repo de GitHub.
2. En Netlify: **Add new site → Import an existing project**, conecta el repo.
3. Netlify detecta `netlify.toml` (build `npm run build`, plugin
   `@netlify/plugin-nextjs`). Define todas las env vars de `.env.example`
   en Site settings → Environment variables.
4. Activa Identity (ver checklist arriba) antes de probar login en producción.

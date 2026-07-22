"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  formToken: string;
  publicKey: string;
  onPaid: () => void;
}

/**
 * Directorio base del cliente Krypton (Izipay/Lyra V4). De aquí cuelgan TRES
 * recursos que hay que cargar juntos y EN ORDEN:
 *   1. ext/classic-reset.css  → estilos del tema "classic"
 *   2. stable/kr-payment-form.min.js (~2 MB) → LIBRERÍA NÚCLEO, la que define
 *      window.KR. Sin ésta, KR no existe y el formulario nunca aparece.
 *   3. ext/classic.js → tema visual (window.KR_CONFIGURATION). Va DESPUÉS del núcleo.
 * El error clásico (y el que teníamos) es cargar solo classic.js: es el tema,
 * no el núcleo. Se puede sobreescribir el host con NEXT_PUBLIC_IZIPAY_JS_BASE
 * si tu panel Mi Cuenta Web indica otro dominio.
 */
const IZIPAY_BASE =
  process.env.NEXT_PUBLIC_IZIPAY_JS_BASE ||
  "https://static.micuentaweb.pe/static/js/krypton-client/V4.0";
const CORE_JS_URL = `${IZIPAY_BASE}/stable/kr-payment-form.min.js`;
const THEME_JS_URL = `${IZIPAY_BASE}/ext/classic.js`;
const THEME_CSS_URL = `${IZIPAY_BASE}/ext/classic-reset.css`;

declare global {
  interface Window {
    KR?: {
      setFormConfig: (config: Record<string, unknown>) => Promise<unknown>;
      onSubmit: (cb: (event: unknown) => boolean | void) => void;
      onError?: (cb: (error: unknown) => void) => void;
    };
  }
}

/** Inserta un <script> una sola vez (idempotente por src) y resuelve al cargar. */
function loadScript(src: string, attrs: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`No se pudo cargar ${src}`)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v);
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`No se pudo cargar ${src}`)));
    document.head.appendChild(script);
  });
}

function loadCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Formulario embebido de Izipay (KR-iframe). Requiere IZIPAY_SHOP_ID /
 * IZIPAY_PUBLIC_KEY reales -- sin ellos, esta sección muestra el estado de
 * "pago no disponible aún" en vez de romper el checkout completo.
 */
export default function IzipayEmbeddedForm({ formToken, publicKey, onPaid }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!publicKey || !formToken) return;
    let cancelado = false;

    (async () => {
      try {
        loadCss(THEME_CSS_URL);
        // Núcleo primero (define window.KR y lee la clave pública del atributo),
        // luego el tema. El núcleo debe llevar kr-public-key.
        await loadScript(CORE_JS_URL, { "kr-public-key": publicKey });
        await loadScript(THEME_JS_URL);
        if (cancelado) return;
        if (!window.KR) throw new Error("window.KR no está definido tras cargar el núcleo");

        // Flujo dinámico: el token llega por API, así que lo inyectamos con
        // setFormConfig; el div .kr-embedded (sin kr-form-token) se renderiza solo.
        await window.KR.setFormConfig({ formToken, "kr-public-key": publicKey });
        window.KR.onSubmit(() => {
          onPaid();
          return true;
        });
        if (window.KR.onError) {
          window.KR.onError((error) => console.error("[Izipay] KR.onError:", error));
        }
      } catch (err) {
        console.error("[Izipay] Falló la inicialización del formulario:", err);
        if (!cancelado) setScriptError(true);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [formToken, publicKey, onPaid]);

  if (!publicKey || !formToken) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
        El pago con tarjeta (Izipay) aún no está activo: faltan las credenciales de producción.
        Configura IZIPAY_SHOP_ID / IZIPAY_USERNAME / IZIPAY_PASSWORD / IZIPAY_PUBLIC_KEY en Netlify.
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        No se pudo cargar el formulario de pago. Verifica la conexión o vuelve a intentar.
      </div>
    );
  }

  return <div id="izipay-form" ref={containerRef} className="kr-embedded" />;
}

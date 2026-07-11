"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  formToken: string;
  publicKey: string;
  onPaid: () => void;
}

// Script del cliente Krypton de Izipay/Lyra. Verifica esta URL contra tu
// panel de comercio (Mi Cuenta Web) cuando actives la cuenta real: Lyra ha
// tenido variantes de esta ruta entre versiones de su API V4.
const IZIPAY_JS_URL =
  process.env.NEXT_PUBLIC_IZIPAY_JS_URL ||
  "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js";

declare global {
  interface Window {
    KR?: {
      setFormConfig: (config: Record<string, unknown>) => Promise<unknown>;
      onSubmit: (cb: (event: unknown) => boolean | void) => void;
      attachForm?: (selector: string) => Promise<unknown>;
      showForm?: (formId: string) => Promise<unknown>;
    };
  }
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

    const script = document.createElement("script");
    script.src = IZIPAY_JS_URL;
    script.setAttribute("kr-public-key", publicKey);
    script.onerror = () => setScriptError(true);
    script.onload = async () => {
      try {
        if (!window.KR) throw new Error("KR no disponible");
        await window.KR.setFormConfig({ formToken, "kr-public-key": publicKey });
        window.KR.onSubmit(() => {
          onPaid();
          return true;
        });
        if (window.KR.attachForm) await window.KR.attachForm("#izipay-form");
        if (window.KR.showForm) await window.KR.showForm("izipay-form");
      } catch {
        setScriptError(true);
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
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

  return (
    <div
      id="izipay-form"
      ref={containerRef}
      className="kr-embedded"
      {...{ "kr-form-token": formToken }}
    />
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

interface Faq {
  pregunta: string;
  respuesta: React.ReactNode;
}

const FAQS: Faq[] = [
  {
    pregunta: "¿Cómo compro en menulima?",
    respuesta: (
      <>
        <p>Es muy simple, en 4 pasos:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Elige tu menú del día (entrada + segundo + refresco) o platos de la carta.</li>
          <li>Presiona &quot;Agregar al carrito&quot; y luego abre el carrito (ícono arriba a la derecha).</li>
          <li>Completa tus datos de entrega o elige recojo en tienda.</li>
          <li>Paga con tarjeta o Yape y sigue tu pedido en tiempo real desde &quot;Mi cuenta&quot;.</li>
        </ol>
      </>
    ),
  },
  {
    pregunta: "¿Qué métodos de pago aceptan?",
    respuesta: (
      <p>
        Aceptamos <strong>tarjetas de crédito y débito</strong> (Visa, Mastercard y más, procesadas de forma segura
        por Izipay) y <strong>Yape</strong>. Todos los pagos son en soles (S/).
      </p>
    ),
  },
  {
    pregunta: "¿Cómo funciona el pago con Yape?",
    respuesta: (
      <>
        <p>Al elegir Yape en el checkout:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Te mostramos nuestro código QR y número de Yape.</li>
          <li>Haces el yapeo desde tu app por el monto exacto del pedido.</li>
          <li>Escribes el número de operación (aparece en tu constancia de Yape) y confirmas.</li>
          <li>Nuestro equipo verifica el pago en minutos y tu pedido pasa a cocina. Puedes seguir el estado en &quot;Mi cuenta&quot;.</li>
        </ol>
      </>
    ),
  },
  {
    pregunta: "¿En qué horario puedo pedir el menú del día?",
    respuesta: (
      <p>
        El menú del día se entrega de <strong>lunes a viernes entre 11:30 a.m. y 3:00 p.m.</strong> Fuera de ese
        horario puedes dejar tu pedido en <strong>preventa</strong> para el siguiente día hábil, o pedir de la carta,
        que está disponible todo el día.
      </p>
    ),
  },
  {
    pregunta: "¿Qué es la preventa?",
    respuesta: (
      <p>
        Si la ventana del menú ya cerró (o es fin de semana), puedes reservar desde ya el menú del siguiente día
        hábil. Pagas normalmente y tu pedido queda programado: lo preparamos y entregamos en la fecha indicada en tu
        confirmación.
      </p>
    ),
  },
  {
    pregunta: "¿Hacen delivery? ¿Cuánto cuesta?",
    respuesta: (
      <p>
        Sí. El delivery tiene un costo fijo de <strong>S/ 6.00</strong> dentro de nuestra zona de cobertura en Lima.
        También puedes elegir <strong>recojo en tienda sin costo</strong>. El estado de tu pedido (en preparación, en
        camino, entregado) se actualiza en tiempo real en &quot;Mi cuenta&quot;.
      </p>
    ),
  },
  {
    pregunta: "¿Emiten boleta o factura?",
    respuesta: (
      <p>
        Sí, ambas. En el checkout eliges <strong>boleta</strong> (con tu DNI) o <strong>factura</strong> (con RUC y
        razón social). El comprobante se emite con los datos que registres en tu pedido.
      </p>
    ),
  },
  {
    pregunta: "¿Cómo solicito un cambio o reembolso?",
    respuesta: (
      <p>
        Si hubo un problema con tu pedido (producto equivocado, incompleto o en mal estado), escríbenos por WhatsApp
        dentro de las <strong>24 horas</strong> siguientes a la entrega, con tu número de pedido y una foto si aplica.
        Evaluamos cada caso y coordinamos la reposición o el reembolso según nuestras{" "}
        <a href="/politicas" className="font-semibold text-aji-600 hover:underline">
          políticas de la tienda
        </a>
        .
      </p>
    ),
  },
  {
    pregunta: "¿Cómo contacto a soporte?",
    respuesta: (
      <p>
        La vía más rápida es el <strong>botón de WhatsApp</strong> (abajo a la derecha en toda la web)
        {WHATSAPP ? ` o directamente al +${WHATSAPP}` : ""}. Atendemos de lunes a viernes en horario de tienda.
        También puedes revisar el estado de tus pedidos en cualquier momento desde &quot;Mi cuenta&quot;.
      </p>
    ),
  },
];

function FaqItem({ faq, abierto, onToggle, id }: { faq: Faq; abierto: boolean; onToggle: () => void; id: string }) {
  return (
    <div className="card overflow-hidden">
      <h2>
        <button
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-display text-base font-semibold text-tinta-900 transition-colors hover:text-aji-600"
          onClick={onToggle}
          aria-expanded={abierto}
          aria-controls={`${id}-panel`}
          id={`${id}-boton`}
        >
          {faq.pregunta}
          <span
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-crema-100 text-aji-600 transition-transform duration-200 ${
              abierto ? "rotate-45" : ""
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-boton`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-sm leading-relaxed text-stone-600">{faq.respuesta}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqList() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <FaqItem
          key={faq.pregunta}
          faq={faq}
          id={`faq-${i}`}
          abierto={abierta === i}
          onToggle={() => setAbierta(abierta === i ? null : i)}
        />
      ))}
    </div>
  );
}

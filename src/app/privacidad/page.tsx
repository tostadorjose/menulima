import type { Metadata } from "next";
import PaginaLegal from "@/components/PaginaLegal";

export const metadata: Metadata = {
  title: "Política de privacidad — menulima",
  description: "Cómo menulima.pe recopila, usa y protege tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <PaginaLegal
      categoria="Legal"
      titulo="Política de privacidad"
      actualizado="julio de 2026"
      intro="En menulima.pe tratamos tus datos personales conforme a la Ley N.º 29733, Ley de Protección de Datos Personales del Perú, y su reglamento. Aquí te explicamos qué datos recopilamos, para qué los usamos y cuáles son tus derechos."
      secciones={[
        {
          titulo: "Qué datos recopilamos",
          contenido: (
            <>
              <p>Recopilamos únicamente los datos necesarios para operar el servicio:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Datos de cuenta: nombre, correo electrónico y celular.</li>
                <li>Datos de entrega: dirección, distrito y referencia.</li>
                <li>Datos de facturación: DNI (boleta) o RUC y razón social (factura).</li>
                <li>Historial de pedidos: productos, montos, fechas y estados.</li>
              </ul>
              <p>
                <strong>No almacenamos números de tarjeta.</strong> Los pagos con tarjeta se procesan directamente en
                la plataforma certificada de Izipay; nosotros solo recibimos la confirmación del pago.
              </p>
            </>
          ),
        },
        {
          titulo: "Para qué usamos tus datos",
          contenido: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Procesar, preparar y entregar tus pedidos.</li>
              <li>Emitir tu boleta o factura.</li>
              <li>Contactarte sobre el estado de tu pedido (WhatsApp o llamada).</li>
              <li>Atender consultas, reclamos y solicitudes de reembolso.</li>
            </ul>
          ),
        },
        {
          titulo: "Con quién compartimos tus datos",
          contenido: (
            <p>
              Solo con los proveedores estrictamente necesarios para completar tu pedido: la pasarela de pagos
              (Izipay), el servicio de reparto (para entregarte, el repartidor recibe tu nombre, dirección y
              teléfono) y los servicios de infraestructura donde opera la web (Netlify, Google). Nunca vendemos ni
              alquilamos tus datos a terceros.
            </p>
          ),
        },
        {
          titulo: "Cuánto tiempo los conservamos",
          contenido: (
            <p>
              Conservamos tus datos mientras tengas una cuenta activa y, en el caso de comprobantes y registros de
              venta, por el plazo que exige la normativa tributaria peruana.
            </p>
          ),
        },
        {
          titulo: "Tus derechos (ARCO)",
          contenido: (
            <p>
              Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición sobre tus datos en
              cualquier momento: escríbenos por WhatsApp indicando tu solicitud y el correo con el que te
              registraste. También puedes editar tus datos de contacto directamente en &quot;Mi cuenta&quot;.
            </p>
          ),
        },
        {
          titulo: "Seguridad",
          contenido: (
            <p>
              La web funciona íntegramente sobre conexiones cifradas (HTTPS). Las contraseñas se gestionan con
              Netlify Identity y nunca son visibles para nuestro equipo. El acceso a los registros de pedidos está
              restringido al personal autorizado.
            </p>
          ),
        },
      ]}
    />
  );
}

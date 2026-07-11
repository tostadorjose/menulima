import type { Metadata } from "next";
import PaginaLegal from "@/components/PaginaLegal";

export const metadata: Metadata = {
  title: "Términos y condiciones — menulima",
  description: "Términos y condiciones de uso de menulima.pe.",
};

export default function TerminosPage() {
  return (
    <PaginaLegal
      categoria="Legal"
      titulo="Términos y condiciones"
      actualizado="julio de 2026"
      intro="Estos términos regulan el uso de menulima.pe. Al navegar la web o realizar un pedido, aceptas estas condiciones. Si no estás de acuerdo con alguna, por favor no utilices el servicio."
      secciones={[
        {
          titulo: "Sobre el servicio",
          contenido: (
            <p>
              menulima.pe es una tienda en línea de venta de comida preparada, con entrega a domicilio (delivery) y
              recojo en tienda, operada en Lima, Perú, como tienda aliada de Nakachi Restaurantes. El servicio está
              dirigido a personas mayores de 18 años o menores con supervisión de un adulto.
            </p>
          ),
        },
        {
          titulo: "Cuenta de usuario",
          contenido: (
            <>
              <p>
                Para comprar puedes crear una cuenta con tu correo y contraseña o con tu cuenta de Google. Eres
                responsable de mantener la confidencialidad de tus credenciales y de la veracidad de los datos que
                registras (nombre, teléfono, dirección).
              </p>
              <p>
                Nos reservamos el derecho de suspender cuentas que hagan uso fraudulento del servicio (datos falsos,
                pagos no reconocidos, abuso de promociones).
              </p>
            </>
          ),
        },
        {
          titulo: "Pedidos y disponibilidad",
          contenido: (
            <p>
              Toda oferta está sujeta a disponibilidad de cocina. El menú del día rota semanalmente y se vende
              únicamente dentro de su horario (lun–vie, 11:30 a.m.–3:00 p.m.) o en preventa para el siguiente día
              hábil. Si por causa excepcional no pudiéramos preparar un producto ya pagado, te lo comunicaremos de
              inmediato y podrás elegir entre un producto sustituto o el reembolso íntegro.
            </p>
          ),
        },
        {
          titulo: "Pagos",
          contenido: (
            <p>
              Los pagos se procesan por Izipay (tarjetas) o Yape. El pedido entra a cocina recién cuando el pago está
              confirmado. Los pagos con Yape requieren verificación manual del número de operación; ingresar números
              de operación falsos constituye fraude y da lugar a la cancelación del pedido y de la cuenta.
            </p>
          ),
        },
        {
          titulo: "Entregas, cambios y reembolsos",
          contenido: (
            <p>
              Las condiciones de entrega, cambio, cancelación y reembolso se detallan en nuestras{" "}
              <a href="/politicas" className="font-semibold text-aji-600 hover:underline">
                Políticas de la tienda
              </a>
              , que forman parte de estos términos.
            </p>
          ),
        },
        {
          titulo: "Propiedad intelectual",
          contenido: (
            <p>
              La marca menulima, el diseño de la web, sus textos y fotografías son de propiedad de la empresa o se
              usan con autorización. No está permitida su reproducción con fines comerciales sin consentimiento
              previo por escrito.
            </p>
          ),
        },
        {
          titulo: "Limitación de responsabilidad",
          contenido: (
            <p>
              Hacemos nuestro mejor esfuerzo por mantener la web disponible y la información exacta. No somos
              responsables por interrupciones ajenas a nuestro control (cortes de servicio de terceros, fuerza
              mayor). Nuestra responsabilidad frente a un pedido se limita al monto efectivamente pagado por él.
            </p>
          ),
        },
        {
          titulo: "Ley aplicable",
          contenido: (
            <p>
              Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se someterá a
              los jueces y tribunales de Lima, sin perjuicio de tu derecho de acudir a INDECOPI como consumidor.
            </p>
          ),
        },
      ]}
    />
  );
}

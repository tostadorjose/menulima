import type { Metadata } from "next";
import PaginaLegal from "@/components/PaginaLegal";

export const metadata: Metadata = {
  title: "Políticas de la tienda — menulima",
  description: "Políticas de pedidos, entregas, cambios y reembolsos de menulima.pe.",
};

export default function PoliticasPage() {
  return (
    <PaginaLegal
      categoria="Legal"
      titulo="Políticas de la tienda"
      actualizado="julio de 2026"
      intro="Estas políticas explican cómo funcionan los pedidos, las entregas y los reembolsos en menulima.pe. Al realizar un pedido aceptas estas condiciones."
      secciones={[
        {
          titulo: "Pedidos",
          contenido: (
            <>
              <p>
                Los pedidos se realizan exclusivamente a través de menulima.pe. Un pedido se considera confirmado
                cuando el pago ha sido verificado (inmediato con tarjeta; en minutos con Yape, tras validar el número
                de operación).
              </p>
              <p>
                El menú del día está disponible de lunes a viernes de 11:30 a.m. a 3:00 p.m. Fuera de ese horario los
                pedidos de menú se registran como preventa para el siguiente día hábil, lo cual se indica claramente
                antes de pagar.
              </p>
            </>
          ),
        },
        {
          titulo: "Precios",
          contenido: (
            <p>
              Todos los precios están expresados en soles (S/) e incluyen impuestos. Los platos a la carta incluyen
              un recargo de S/ 2.00 sobre el precio de salón, indicado ya en el precio publicado. El costo de
              delivery se muestra antes de confirmar el pedido. Los precios pueden cambiar sin previo aviso, pero
              nunca después de que tu pedido fue confirmado.
            </p>
          ),
        },
        {
          titulo: "Entregas (delivery) y recojo",
          contenido: (
            <>
              <p>
                El delivery tiene un costo fijo de S/ 6.00 dentro de nuestra zona de cobertura en Lima. El tiempo
                estimado de entrega es de 30 a 60 minutos desde la confirmación del pago, y puede variar por tráfico,
                clima o alta demanda.
              </p>
              <p>
                El recojo en tienda no tiene costo. Te avisamos cuando tu pedido esté listo; preséntate con tu número
                de pedido.
              </p>
              <p>
                Si el repartidor no puede ubicarte tras intentos razonables de contacto (llamada y WhatsApp al número
                que registraste), el pedido se considera entregado y no aplica reembolso.
              </p>
            </>
          ),
        },
        {
          titulo: "Cambios y cancelaciones",
          contenido: (
            <p>
              Puedes solicitar cambios o cancelar tu pedido por WhatsApp solo mientras aún no haya entrado a cocina
              (estado &quot;Pago confirmado&quot;). Una vez en preparación, ya no es posible cancelarlo. Las
              preventas pueden cancelarse hasta las 9:00 a.m. del día de entrega.
            </p>
          ),
        },
        {
          titulo: "Reembolsos",
          contenido: (
            <>
              <p>
                Si tu pedido llegó incompleto, equivocado o en mal estado, escríbenos por WhatsApp dentro de las 24
                horas siguientes a la entrega con tu número de pedido y fotos del producto. Evaluamos cada caso y, de
                corresponder, ofrecemos reposición del producto o reembolso total o parcial.
              </p>
              <p>
                Los reembolsos de pagos con tarjeta se procesan por el mismo medio (el plazo de abono depende de tu
                banco, usualmente 7 a 15 días útiles). Los pagos con Yape se devuelven por Yape al mismo número desde
                el que se pagó.
              </p>
            </>
          ),
        },
        {
          titulo: "Libro de reclamaciones",
          contenido: (
            <p>
              Conforme a la normativa peruana de protección al consumidor (INDECOPI), ponemos a tu disposición
              nuestro Libro de Reclamaciones. Solicítalo por WhatsApp y te enviaremos el formato correspondiente.
            </p>
          ),
        },
      ]}
    />
  );
}

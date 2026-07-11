import { NextResponse } from "next/server";
import { z } from "zod";
import { findCartaItemByKey, computeCartaPrice } from "@/lib/cartaData";
import { getMenuAvailability } from "@/lib/menuAvailability";
import { generateOrderId } from "@/lib/orderId";
import { computeFlete } from "@/lib/pricing";
import { createOrder, getPrices } from "@/lib/sheetsClient";
import { getLimaTimeHHMM, getLimaTodayISO } from "@/lib/time";
import type { CartItem, Order } from "@/lib/types";

const menuItemSchema = z.object({
  kind: z.literal("menu"),
  id: z.string(),
  semana: z.number(),
  dia: z.string(),
  fechaEntrega: z.string(),
  entradaElegida: z.string(),
  segundoElegido: z.string(),
  bebida: z.string(),
  precioUnitario: z.number(),
  cantidad: z.number().int().positive(),
});

const cartaItemSchema = z.object({
  kind: z.literal("carta"),
  id: z.string(),
  key: z.string(),
  nombre: z.string(),
  precioUnitario: z.number(),
  cantidad: z.number().int().positive(),
});

const bodySchema = z.object({
  items: z.array(z.union([menuItemSchema, cartaItemSchema])).min(1),
  canal: z.enum(["delivery", "recojo"]),
  metodoPago: z.enum(["izipay", "yape"]),
  direccion: z
    .object({
      direccion: z.string().min(1),
      referencia: z.string().optional(),
      distrito: z.string().optional(),
    })
    .optional(),
  comprobante: z.object({
    tipo: z.enum(["boleta", "factura"]),
    dni: z.string().optional(),
    ruc: z.string().optional(),
    razonSocial: z.string().optional(),
    nombre: z.string().min(1),
    telefono: z.string().min(1),
    email: z.string().email(),
  }),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }
  const body = parsed.data;

  if (body.canal === "delivery" && !body.direccion) {
    return NextResponse.json({ error: "Falta la dirección de entrega." }, { status: 400 });
  }

  const prices = await getPrices().catch(() => []);
  const priceMap = new Map(prices.map((p) => [p.key, p.precioBase]));

  const now = new Date();
  const availability = getMenuAvailability(now, priceMap.get("menu"));

  const items: CartItem[] = [];
  for (const raw of body.items) {
    if (raw.kind === "menu") {
      // El servidor manda: si el ítem no coincide con la disponibilidad vigente
      // (ventana horaria / fecha de preventa), se rechaza -- el reloj del
      // cliente nunca decide esto.
      const entradaValida = availability.menu.entrada.includes(raw.entradaElegida);
      const segundoValido = availability.menu.segundo.includes(raw.segundoElegido);
      if (
        raw.fechaEntrega !== availability.fechaEntrega ||
        raw.dia !== availability.dia ||
        raw.semana !== availability.semana ||
        !entradaValida ||
        !segundoValido
      ) {
        return NextResponse.json(
          {
            error:
              "El horario de menú cambió mientras armabas tu pedido. Vuelve a /menu para ver la oferta vigente y agrega de nuevo.",
          },
          { status: 409 }
        );
      }
      items.push({
        kind: "menu",
        id: raw.id,
        semana: availability.semana,
        dia: availability.dia,
        fechaEntrega: availability.fechaEntrega,
        entradaElegida: raw.entradaElegida,
        segundoElegido: raw.segundoElegido,
        bebida: availability.bebida,
        precioUnitario: availability.precioMenu,
        cantidad: raw.cantidad,
      });
    } else {
      const cartaItem = findCartaItemByKey(raw.key);
      if (!cartaItem) {
        return NextResponse.json({ error: `Plato no encontrado: ${raw.key}` }, { status: 400 });
      }
      const precioBase = priceMap.get(cartaItem.key) ?? cartaItem.precioBase;
      const precioUnitario = computeCartaPrice({ precioBase, categoria: cartaItem.categoria });
      items.push({
        kind: "carta",
        id: raw.id,
        key: cartaItem.key,
        nombre: cartaItem.plato,
        precioUnitario,
        cantidad: raw.cantidad,
      });
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0);
  const flete = computeFlete(body.canal);
  const total = subtotal + flete;
  const esPreventa = items.some((i) => i.kind === "menu");

  const order: Order = {
    orderId: generateOrderId(now),
    fecha: getLimaTodayISO(now),
    hora: getLimaTimeHHMM(now),
    emailCliente: body.comprobante.email,
    nombre: body.comprobante.nombre,
    telefono: body.comprobante.telefono,
    canal: body.canal,
    tipo: items.every((i) => i.kind === "carta") ? "carta" : "menu",
    items,
    subtotal,
    flete,
    total,
    direccion: body.direccion?.direccion,
    referencia: body.direccion?.referencia,
    preventa: esPreventa && availability.esPreventa,
    fechaEntrega: esPreventa ? availability.fechaEntrega : getLimaTodayISO(now),
    metodoPago: body.metodoPago,
    estado: "pendiente_pago",
    comprobanteTipo: body.comprobante.tipo,
    comprobanteDatos: JSON.stringify({
      dni: body.comprobante.dni,
      ruc: body.comprobante.ruc,
      razonSocial: body.comprobante.razonSocial,
    }),
    creadoEn: now.toISOString(),
    actualizadoEn: now.toISOString(),
  };

  try {
    const { orderId } = await createOrder(order);
    return NextResponse.json({ orderId, subtotal, flete, total });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo crear el pedido." },
      { status: 500 }
    );
  }
}

import type { CartaCategoria, CartaCategoriaId, CartaItem } from "./types";

/** Recargo obligatorio sobre el precio base de un plato a la carta. */
export const RECARGO_CARTA = 2;

/**
 * Asunción explícita (ajustable aquí, en un solo lugar): el recargo de S/2.00
 * aplica solo a categorías que son "platos" propiamente dichos. Guarniciones
 * y bebidas se tratan como acompañamientos, no como "platos a la carta", así
 * que quedan fuera del recargo.
 */
export const CATEGORIAS_CON_RECARGO: CartaCategoriaId[] = [
  "comida_criolla_carnes",
  "pescados_mariscos",
  "sopas",
];

const RAW_CATEGORIAS: { id: CartaCategoriaId; nombre: string; items: [string, number][] }[] = [
  {
    id: "comida_criolla_carnes",
    nombre: "Comida criolla y carnes",
    items: [
      ["Apanado", 24],
      ["Apanado encebollado", 26],
      ["Milanesa", 24],
      ["Pechuga a la plancha", 22],
      ["Pollo al orégano", 24],
      ["Bistec", 24],
      ["Bistec encebollado", 26],
      ["Lomo saltado", 26],
      ["Taipa de verduras", 24],
      ["Arroz chaufa", 20],
      ["Tallarín saltado", 22],
    ],
  },
  {
    id: "pescados_mariscos",
    nombre: "Pescados y mariscos",
    items: [
      ["Pescado a lo macho", 38],
      ["Sudado de pescado", 36],
      ["Apanado de pescado", 32],
      ["Apanado de pescado encebollado", 34],
      ["Taipa mixto", 38],
      ["Chicharrón de pescado", 32],
      ["Pescado frito", 32],
      ["Pescado frito encebollado", 34],
      ["Milanesa de pescado", 32],
    ],
  },
  {
    id: "sopas",
    nombre: "Sopas",
    items: [
      ["Chupe de pescado", 26],
      ["Sopa a la criolla o minuta", 20],
      ["Sustancia", 18],
      ["Dieta de pollo", 16],
    ],
  },
  {
    id: "guarniciones",
    nombre: "Guarniciones",
    items: [
      ["Arroz (gohan)", 5],
      ["Ensalada", 5],
      ["Papas fritas", 8],
    ],
  },
  {
    id: "bebidas",
    nombre: "Bebidas",
    items: [
      ["Gaseosa (Coca-Cola / Inca Kola)", 5],
      ["Agua (San Luis)", 4],
      ["Aloe Vera 300 ml.", 8],
      ["Jarra de limonada / naranjada", 20],
      ["Cerveza Pilsen 305 ml.", 10],
      ["Cerveza japonesa (Asahi / Sapporo)", 20],
      ["Tetera de ocha", 18],
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos tras normalizar NFD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CARTA_CATEGORIAS: CartaCategoria[] = RAW_CATEGORIAS.map((cat) => ({
  id: cat.id,
  nombre: cat.nombre,
  aplicaRecargo: CATEGORIAS_CON_RECARGO.includes(cat.id),
  items: cat.items.map(([plato, precioBase]) => ({
    key: `${cat.id}__${slugify(plato)}`,
    plato,
    precioBase,
    categoria: cat.id,
  })),
}));

export const ALL_CARTA_ITEMS: CartaItem[] = CARTA_CATEGORIAS.flatMap((c) => c.items);

/**
 * Precio final de venta de un ítem de carta: precio base + recargo
 * obligatorio de S/2.00 si la categoría aplica recargo. Este es el único
 * punto de la app que calcula el precio mostrado/cobrado — nunca se
 * hardcodea en la UI.
 */
export function computeCartaPrice(item: { precioBase: number; categoria: string }): number {
  const recargo = CATEGORIAS_CON_RECARGO.includes(item.categoria as CartaCategoriaId) ? RECARGO_CARTA : 0;
  return item.precioBase + recargo;
}

/** Etiquetas visibles de cada categoría, en el orden en que se muestran en la carta. */
export const CATEGORIA_LABELS: { id: CartaCategoriaId; nombre: string }[] = CARTA_CATEGORIAS.map((c) => ({
  id: c.id,
  nombre: c.nombre,
}));

export function findCartaItemByKey(key: string): CartaItem | undefined {
  return ALL_CARTA_ITEMS.find((i) => i.key === key);
}

export type MenuWeek = 1 | 2 | 3 | 4;

export type MenuDayKey = "Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes";

export interface DayMenu {
  entrada: [string, string];
  segundo: [string, string];
}

export type WeekMenu = Record<MenuDayKey, DayMenu>;

export interface CartaItem {
  key: string;
  plato: string;
  precioBase: number;
  categoria: CartaCategoriaId;
}

export type CartaCategoriaId =
  | "comida_criolla_carnes"
  | "pescados_mariscos"
  | "sopas"
  | "guarniciones"
  | "bebidas";

export interface CartaCategoria {
  id: CartaCategoriaId;
  nombre: string;
  aplicaRecargo: boolean;
  items: CartaItem[];
}

export type CanalEntrega = "delivery" | "recojo";
export type MetodoPago = "izipay" | "yape";
export type TipoPedido = "menu" | "carta";

export type EstadoPedido =
  | "pendiente_pago"
  | "pendiente_verificacion"
  | "pagado"
  | "en_preparacion"
  | "en_camino"
  | "entregado"
  | "cancelado";

export interface CartMenuItem {
  kind: "menu";
  id: string;
  semana: MenuWeek;
  dia: MenuDayKey;
  fechaEntrega: string; // YYYY-MM-DD
  entradaElegida: string;
  segundoElegido: string;
  bebida: string;
  precioUnitario: number;
  cantidad: number;
}

export interface CartCartaItem {
  kind: "carta";
  id: string;
  key: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export type CartItem = CartMenuItem | CartCartaItem;

export interface DireccionEntrega {
  direccion: string;
  referencia?: string;
  distrito?: string;
  lat?: number;
  lng?: number;
}

export interface ComprobanteInfo {
  tipo: "boleta" | "factura";
  dni?: string;
  ruc?: string;
  razonSocial?: string;
  nombre: string;
  telefono: string;
  email: string;
}

export interface Order {
  orderId: string;
  fecha: string;
  hora: string;
  emailCliente: string;
  nombre: string;
  telefono: string;
  canal: CanalEntrega;
  tipo: TipoPedido;
  items: CartItem[];
  subtotal: number;
  flete: number;
  total: number;
  direccion?: string;
  lat?: number;
  lng?: number;
  referencia?: string;
  preventa: boolean;
  fechaEntrega: string;
  metodoPago: MetodoPago;
  estado: EstadoPedido;
  rappiCargoId?: string;
  operacionYape?: string;
  comprobanteTipo: "boleta" | "factura";
  comprobanteDatos: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface PriceEntry {
  key: string;
  nombre: string;
  categoria: string;
  precioBase: number;
  /** false = oculto de la carta pública; undefined se trata como activo. */
  activo?: boolean;
  imagenUrl?: string;
}

import type { MenuDayKey, MenuWeek, WeekMenu } from "./types";

/** Precio por defecto del menú (S/), editable luego desde el backoffice → Sheets. */
export const MENU_PRICE_DEFAULT = 22;

/**
 * Data de negocio entregada por el cliente. Cada día trae 2 opciones de
 * entrada y 2 de segundo — esa lista de 2 ES la elección "ensalada o sopa a
 * elección"; el comensal elige una de cada arreglo.
 */
export const WEEK_MENUS: Record<MenuWeek, WeekMenu> = {
  1: {
    Lunes: { entrada: ["Ocopa", "Sopa fuchifú"], segundo: ["Pollo al ají", "Coliflor saltada"] },
    Martes: { entrada: ["Papa rellena", "Sopa de verduras"], segundo: ["Bistec a la cacerola", "Locro"] },
    Miercoles: { entrada: ["Huevo a la rusa", "Menestrón"], segundo: ["Adobo de chancho", "Taipá"] },
    Jueves: {
      entrada: ["Ceviche de champiñones", "Sopa a la minuta"],
      segundo: ["Mondonguito a la italiana", "Hamburguesa"],
    },
    Viernes: { entrada: ["Salpicón de pollo", "Sancochado"], segundo: ["Seco con frejoles", "Chanfainita"] },
  },
  2: {
    Lunes: { entrada: ["Papa a la huancaína", "Sopa fuchifú"], segundo: ["Arroz con pollo", "Kare Raisu"] },
    Martes: { entrada: ["Causa", "Sopa de verduras"], segundo: ["Tallarín en salsa roja", "Carapulcra"] },
    Miercoles: { entrada: ["Fideos con atún", "Menestrón"], segundo: ["Ají de gallina", "Escabeche de pollo"] },
    Jueves: {
      entrada: ["Ensalada de castañas", "Sopa a la minuta"],
      segundo: ["Estofado de pollo", "Olluquito"],
    },
    Viernes: { entrada: ["Papa con atún", "Sancochado"], segundo: ["Seco con frejoles", "Patita con maní"] },
  },
  3: {
    Lunes: { entrada: ["Crema de rocoto", "Sancochado"], segundo: ["Pollo al horno", "Lentejas"] },
    Martes: { entrada: ["Tequeños", "Caldillo con huevo"], segundo: ["Tallarines verdes", "Picante de carne"] },
    Miercoles: {
      entrada: ["Sopa fuchifú", "Ensalada de castañas"],
      segundo: ["Asado con puré", "Pepián de choclo"],
    },
    Jueves: { entrada: ["Solterito", "Menestrón"], segundo: ["Enrollado de pollo", "Cau Cau"] },
    Viernes: { entrada: ["Korokke", "Sustancia"], segundo: ["Seco con frejoles", "Lasagna"] },
  },
  4: {
    Lunes: { entrada: ["Suflé de papa", "Sancochado"], segundo: ["Caigua rellena", "Chicken katsu"] },
    Martes: { entrada: ["Wantán frito", "Caldillo con huevo"], segundo: ["Arroz con mariscos", "Yakisoba"] },
    Miercoles: {
      entrada: ["Ensalada de castañas", "Sopa fuchifú"],
      segundo: ["Pollo teriyaki", "Pescado guisado"],
    },
    Jueves: { entrada: ["Solterito", "Menestrón"], segundo: ["Chuleta", "Lasagna de verduras"] },
    Viernes: { entrada: ["Ensalada mixta", "Sustancia"], segundo: ["Seco con frejoles", "Trigo"] },
  },
};

/**
 * Placeholder editable: el set de datos no especificó el "refresco del día".
 * Ajusta libremente esta constante — es el único lugar donde vive esta regla.
 */
export const BEBIDA_DEL_DIA: Record<MenuDayKey, string> = {
  Lunes: "Chicha morada",
  Martes: "Limonada",
  Miercoles: "Maracuyá",
  Jueves: "Agua de manzana",
  Viernes: "Refresco de piña",
};

export function getDayMenu(semana: MenuWeek, dia: MenuDayKey) {
  return WEEK_MENUS[semana][dia];
}

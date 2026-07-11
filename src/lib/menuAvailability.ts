import { BEBIDA_DEL_DIA, getDayMenu, MENU_PRICE_DEFAULT } from "./menuData";
import {
  calendarDateToISO,
  getLimaCalendarDate,
  getMenuDayKeyOf,
  getMenuWeekNumberOf,
  getNextMenuCalendarDate,
  hasMenuWindowClosed,
  isMenuWindowOpen,
  minutesUntilWindowCloses,
  type CalendarDate,
} from "./time";
import type { DayMenu, MenuDayKey, MenuWeek } from "./types";

export interface MenuAvailability {
  /** true si hoy se puede comprar menú para entrega inmediata (día hábil + dentro de la ventana horaria). */
  disponibleHoy: boolean;
  /** true si es preventa (fuera de horario o fin de semana): el pedido es para la próxima fecha con menú. */
  esPreventa: boolean;
  fechaEntrega: string; // YYYY-MM-DD, Lima
  semana: MenuWeek;
  dia: MenuDayKey;
  menu: DayMenu;
  bebida: string;
  precioMenu: number;
  minutosParaCierre: number | null;
}

/**
 * Punto único de verdad para "qué menú se puede comprar ahora mismo".
 * Se usa tanto en la UI (para pintar el estado) como en el servidor, en
 * /api/checkout/create-order, que SIEMPRE debe volver a llamar esta función
 * con la hora del servidor — nunca confiar en lo que mande el cliente.
 */
export function getMenuAvailability(
  now: Date = new Date(),
  precioMenu: number = MENU_PRICE_DEFAULT
): MenuAvailability {
  const hoy = getLimaCalendarDate(now);
  const diaHoy = getMenuDayKeyOf(hoy);
  const ventanaAbierta = isMenuWindowOpen(now);
  const disponibleHoy = diaHoy != null && ventanaAbierta;

  // Si es día hábil y la ventana de hoy AÚN NO CIERRA (ej. son las 10 a.m.),
  // la preventa apunta al menú de HOY (que abre 11:30). Solo si ya pasaron
  // las 3:00 p.m. (o es fin de semana) se salta al siguiente día hábil.
  const hoyTodaviaAplica = diaHoy != null && !hasMenuWindowClosed(now);
  const targetDate: CalendarDate = hoyTodaviaAplica ? hoy : getNextMenuCalendarDate(now);
  const dia = getMenuDayKeyOf(targetDate);

  if (!dia) {
    // No debería ocurrir: getNextMenuCalendarDate garantiza un día hábil.
    throw new Error("No se pudo determinar un día de menú válido.");
  }

  const semana = getMenuWeekNumberOf(targetDate);
  const menu = getDayMenu(semana, dia);

  return {
    disponibleHoy,
    esPreventa: !disponibleHoy,
    fechaEntrega: calendarDateToISO(targetDate),
    semana,
    dia,
    menu,
    bebida: BEBIDA_DEL_DIA[dia],
    precioMenu,
    minutosParaCierre: disponibleHoy ? minutesUntilWindowCloses(now) : null,
  };
}

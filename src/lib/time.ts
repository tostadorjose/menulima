import type { MenuDayKey, MenuWeek } from "./types";

const LIMA_TZ = "America/Lima";

/** Anclaje real de negocio: el 10 de julio de 2026 (viernes) es semana 3 del ciclo. */
export const MENU_WEEK_ANCHOR = { year: 2026, month: 7, day: 10 } as const;
export const MENU_WEEK_ANCHOR_WEEK: MenuWeek = 3;

export const MENU_WINDOW_START = { hour: 11, minute: 30 };
export const MENU_WINDOW_END = { hour: 15, minute: 0 };

export interface LimaDateParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

/** Fecha calendario "pura" (sin hora ni zona horaria) para aritmética de días/semanas. */
export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const DAY_KEY_BY_WEEKDAY: Record<number, MenuDayKey | null> = {
  0: null, // domingo
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
  6: null, // sábado
};

/**
 * Extrae año/mes/día/hora/minuto en la zona horaria de Lima a partir de
 * cualquier Date, sin depender del huso horario del servidor (Netlify
 * ejecuta las funciones en UTC).
 */
export function getLimaParts(date: Date = new Date()): LimaDateParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: LIMA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) map[p.type] = p.value;

  let hour = Number(map.hour);
  if (hour === 24) hour = 0; // Intl a veces representa medianoche como "24"

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
  };
}

export function getLimaCalendarDate(date: Date = new Date()): CalendarDate {
  const { year, month, day } = getLimaParts(date);
  return { year, month, day };
}

// ── Aritmética de fechas-calendario (sin hora, sin timezone real) ─────────
// Se representan internamente como medianoche UTC solo para poder sumar/restar
// días con Date.UTC; ese Date "de trabajo" nunca se vuelve a interpretar como
// un instante real ni se pasa a getLimaParts (evita correr el día por el
// desfase UTC-5 de Lima).

function calendarToWorkingDate(cd: CalendarDate): Date {
  return new Date(Date.UTC(cd.year, cd.month - 1, cd.day));
}

function workingDateToCalendar(d: Date): CalendarDate {
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function weekdayOf(cd: CalendarDate): number {
  return calendarToWorkingDate(cd).getUTCDay(); // 0=domingo..6=sábado
}

function addDays(cd: CalendarDate, days: number): CalendarDate {
  const d = calendarToWorkingDate(cd);
  d.setUTCDate(d.getUTCDate() + days);
  return workingDateToCalendar(d);
}

function mondayOf(cd: CalendarDate): CalendarDate {
  const wd = weekdayOf(cd);
  const diffToMonday = wd === 0 ? -6 : 1 - wd;
  return addDays(cd, diffToMonday);
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Semana del ciclo (1..4) para una fecha-calendario dada.
 * Test: getMenuWeekNumberOf({year:2026,month:7,day:10}) === 3
 */
export function getMenuWeekNumberOf(cd: CalendarDate): MenuWeek {
  const monday = mondayOf(cd);
  const anchorMonday = mondayOf(MENU_WEEK_ANCHOR);

  const weeksDiff = Math.round(
    (calendarToWorkingDate(monday).getTime() - calendarToWorkingDate(anchorMonday).getTime()) /
      MS_PER_WEEK
  );
  const idx = mod(MENU_WEEK_ANCHOR_WEEK - 1 + weeksDiff, 4);
  return (idx + 1) as MenuWeek;
}

/** Semana del ciclo (1..4) para un Date real, calculada en zona horaria de Lima. */
export function getMenuWeekNumber(date: Date = new Date()): MenuWeek {
  return getMenuWeekNumberOf(getLimaCalendarDate(date));
}

export function getMenuDayKeyOf(cd: CalendarDate): MenuDayKey | null {
  return DAY_KEY_BY_WEEKDAY[weekdayOf(cd)] ?? null;
}

/** Día de menú (Lunes..Viernes) para un Date real, o null si cae en fin de semana. */
export function getMenuDayKey(date: Date = new Date()): MenuDayKey | null {
  return getMenuDayKeyOf(getLimaCalendarDate(date));
}

function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

/** true si la hora actual en Lima cae dentro de la ventana de compra de menú (11:30–15:00). */
export function isMenuWindowOpen(date: Date = new Date()): boolean {
  const { hour, minute } = getLimaParts(date);
  const nowMin = toMinutes(hour, minute);
  const startMin = toMinutes(MENU_WINDOW_START.hour, MENU_WINDOW_START.minute);
  const endMin = toMinutes(MENU_WINDOW_END.hour, MENU_WINDOW_END.minute);
  return nowMin >= startMin && nowMin < endMin;
}

/** true si la ventana de hoy YA cerró (pasadas las 3:00 p.m. hora Lima). */
export function hasMenuWindowClosed(date: Date = new Date()): boolean {
  const { hour, minute } = getLimaParts(date);
  const endMin = toMinutes(MENU_WINDOW_END.hour, MENU_WINDOW_END.minute);
  return toMinutes(hour, minute) >= endMin;
}

export function calendarDateToISO(cd: CalendarDate): string {
  return `${cd.year}-${String(cd.month).padStart(2, "0")}-${String(cd.day).padStart(2, "0")}`;
}

/** YYYY-MM-DD de "hoy" en Lima. */
export function getLimaTodayISO(date: Date = new Date()): string {
  return calendarDateToISO(getLimaCalendarDate(date));
}

/** HH:mm de la hora actual en Lima. */
export function getLimaTimeHHMM(date: Date = new Date()): string {
  const { hour, minute } = getLimaParts(date);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Siguiente fecha con menú disponible (día hábil L-V), saltando fines de semana.
 * Se usa para la preventa cuando la ventana de hoy ya cerró, o cuando hoy es
 * sábado/domingo.
 */
export function getNextMenuCalendarDate(date: Date = new Date()): CalendarDate {
  let cd = getLimaCalendarDate(date);
  do {
    cd = addDays(cd, 1);
  } while (getMenuDayKeyOf(cd) == null);
  return cd;
}

export function minutesUntilWindowCloses(date: Date = new Date()): number {
  const { hour, minute } = getLimaParts(date);
  const nowMin = toMinutes(hour, minute);
  const endMin = toMinutes(MENU_WINDOW_END.hour, MENU_WINDOW_END.minute);
  return Math.max(0, endMin - nowMin);
}

export function minutesUntilWindowOpens(date: Date = new Date()): number {
  const { hour, minute } = getLimaParts(date);
  const nowMin = toMinutes(hour, minute);
  const startMin = toMinutes(MENU_WINDOW_START.hour, MENU_WINDOW_START.minute);
  return Math.max(0, startMin - nowMin);
}

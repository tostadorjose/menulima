/** Flete plano de delivery. Ajusta este único valor si luego quieres una tabla por zona. */
export const FLETE_DELIVERY = 6;

export function computeFlete(canal: "delivery" | "recojo"): number {
  return canal === "delivery" ? FLETE_DELIVERY : 0;
}

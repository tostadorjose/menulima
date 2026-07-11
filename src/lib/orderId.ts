export function generateOrderId(date: Date = new Date()): string {
  const y = date.getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ML${y}-${rand}`;
}

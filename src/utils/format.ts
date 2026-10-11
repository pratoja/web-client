export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  return safeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function toNumberCoord(value: number | string | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

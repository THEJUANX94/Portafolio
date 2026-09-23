import type { Locale } from './i18n';

const MONTHS: Record<Locale, readonly string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const PRESENT: Record<Locale, string> = { es: 'hoy', en: 'present' };

export const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function parse(ym: string): { year: number; month: number } {
  if (!YEAR_MONTH.test(ym)) throw new Error(`Fecha inválida (se espera YYYY-MM): ${ym}`);
  const [year, month] = ym.split('-').map(Number);
  return { year, month };
}

export function formatMonth(ym: string, locale: Locale): string {
  const { year, month } = parse(ym);
  return `${MONTHS[locale][month - 1]} ${year}`;
}

export function formatRange(start: string, end: string | null, locale: Locale): string {
  const to = end === null ? PRESENT[locale] : formatMonth(end, locale);
  return `${formatMonth(start, locale)} – ${to}`;
}

/** Meses inclusivos: mar–jul = 5. */
export function monthsBetween(start: string, end: string): number {
  const a = parse(start);
  const b = parse(end);
  return (b.year - a.year) * 12 + (b.month - a.month) + 1;
}

const UNITS: Record<Locale, { y: [string, string]; m: [string, string] }> = {
  es: { y: ['año', 'años'], m: ['mes', 'meses'] },
  en: { y: ['yr', 'yrs'], m: ['mo', 'mos'] },
};

export function formatDuration(totalMonths: number, locale: Locale): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const u = UNITS[locale];
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? u.y[0] : u.y[1]}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? u.m[0] : u.m[1]}`);
  return parts.join(' ');
}

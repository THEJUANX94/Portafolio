import { LINES } from './schemas';

export type Line = (typeof LINES)[number];

export interface MetroInput {
  id: string;
  line: Line;
  start: string;
  end: string | null;
  approximate?: boolean;
}

export interface Track {
  /** Tramo desde el borde superior de la fila hasta el punto de la estación. */
  up: boolean;
  /** Tramo desde el punto de la estación hasta el borde inferior de la fila. */
  down: boolean;
}

export interface MetroRow<T extends MetroInput> {
  entry: T;
  tracks: Record<Line, Track>;
}

export interface MetroLayout<T extends MetroInput> {
  lines: Line[];
  rows: MetroRow<T>[];
}

/**
 * Ordena estaciones (reciente → antigua; `end: null` cuenta como `now`) y calcula,
 * por fila, qué tramos de cada línea se dibujan. Todas las líneas nacen en la
 * terminal superior y terminan en su estación más antigua.
 */
export function buildMetro<T extends MetroInput>(entries: readonly T[], now: string): MetroLayout<T> {
  const endKey = (e: T) => e.end ?? now;
  const sorted = [...entries].sort(
    (a, b) =>
      endKey(b).localeCompare(endKey(a)) || b.start.localeCompare(a.start) || a.id.localeCompare(b.id),
  );

  const lines = LINES.filter((line) => sorted.some((e) => e.line === line));
  const lastRow = new Map<Line, number>();
  sorted.forEach((e, i) => lastRow.set(e.line, i));

  const rows = sorted.map((entry, i) => {
    const tracks = {} as Record<Line, Track>;
    for (const line of LINES) {
      const last = lastRow.get(line);
      tracks[line] = last === undefined ? { up: false, down: false } : { up: i <= last, down: i < last };
    }
    return { entry, tracks };
  });

  return { lines, rows };
}

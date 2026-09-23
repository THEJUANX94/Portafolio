export const CASCADE = {
  stepMs: 90,
  colorMs: 350,
  maxStep: 8,
  rowTolerancePx: 24,
  get totalMs() {
    return this.maxStep * this.stepMs + this.colorMs;
  },
} as const;

interface Rect {
  top: number;
  left: number;
}

/**
 * Paso de cascada de cada bloque (mismo orden que la entrada).
 * Orden de lectura: filas de arriba hacia abajo (con tolerancia) y, dentro de una fila, de izquierda a derecha.
 * Los bloques por debajo de la ventana van al último paso.
 */
export function cascadeSteps(rects: readonly Rect[], viewportHeight: number): number[] {
  const order = rects
    .map((rect, index) => ({ rect, index }))
    .sort((a, b) => {
      const dy = a.rect.top - b.rect.top;
      if (Math.abs(dy) > CASCADE.rowTolerancePx) return dy;
      return a.rect.left - b.rect.left || dy;
    });

  const steps = new Array<number>(rects.length);
  order.forEach(({ rect, index }, position) => {
    steps[index] = rect.top > viewportHeight ? CASCADE.maxStep : Math.min(position, CASCADE.maxStep);
  });
  return steps;
}

import { describe, it, expect } from 'vitest';
import { buildMetro } from '../../src/lib/metro';

const e = (id: string, line: 'work' | 'projects' | 'education', start: string, end: string | null) => ({ id, line, start, end });

const hackathon = e('hackathon', 'projects', '2025-10', null);
const techLead = e('tech-lead', 'work', '2025-08', '2026-08');
const intern = e('intern', 'work', '2025-03', '2025-07');
const NOW = '2026-09';

describe('buildMetro — orden', () => {
  it('ordena de lo más reciente a lo más antiguo; vigente (null) usa "now"', () => {
    const { rows } = buildMetro([intern, hackathon, techLead], NOW);
    expect(rows.map((r) => r.entry.id)).toEqual(['hackathon', 'tech-lead', 'intern']);
  });
  it('empate en fin → inicio más reciente primero; luego id', () => {
    const a = e('a', 'work', '2024-01', '2025-01');
    const b = e('b', 'work', '2024-06', '2025-01');
    const c = e('c', 'projects', '2024-06', '2025-01');
    expect(buildMetro([a, c, b], NOW).rows.map((r) => r.entry.id)).toEqual(['b', 'c', 'a']);
  });
  it('no muta la entrada y conserva el objeto original', () => {
    const input = [intern, techLead];
    const { rows } = buildMetro(input, NOW);
    expect(input[0]).toBe(intern);
    expect(rows[0].entry).toBe(techLead);
  });
});

describe('buildMetro — líneas', () => {
  it('solo las líneas presentes, en orden canónico work → projects → education', () => {
    const edu = e('uptc', 'education', '2020-01', '2026-06');
    expect(buildMetro([edu, hackathon, techLead], NOW).lines).toEqual(['work', 'projects', 'education']);
    expect(buildMetro([hackathon], NOW).lines).toEqual(['projects']);
  });
  it('vacío → sin líneas ni filas', () => {
    expect(buildMetro([], NOW)).toEqual({ lines: [], rows: [] });
  });
});

describe('buildMetro — tramos por fila', () => {
  it('cada línea corre desde la terminal hasta su estación más antigua', () => {
    const { rows } = buildMetro([hackathon, techLead, intern], NOW);
    // fila 0: hackathon (projects) — work pasa de largo, projects termina aquí
    expect(rows[0].tracks).toEqual({
      work: { up: true, down: true },
      projects: { up: true, down: false },
      education: { up: false, down: false },
    });
    // fila 1: tech-lead — solo work
    expect(rows[1].tracks.work).toEqual({ up: true, down: true });
    expect(rows[1].tracks.projects).toEqual({ up: false, down: false });
    // fila 2: intern — work termina
    expect(rows[2].tracks.work).toEqual({ up: true, down: false });
  });

  it('una sola línea: el tramo corre hasta la última estación', () => {
    const master = e('master', 'education', '2024-01', '2025-12');
    const uptc = e('uptc', 'education', '2020-01', '2023-12');
    const { rows } = buildMetro([master, uptc], NOW);
    expect(rows[0].tracks).toEqual({
      work: { up: false, down: false },
      projects: { up: false, down: false },
      education: { up: true, down: true },
    });
    expect(rows[1].tracks).toEqual({
      work: { up: false, down: false },
      projects: { up: false, down: false },
      education: { up: true, down: false },
    });
  });
});

export interface AsciiComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  lines: string[];
  width: number;
  height: number;
}

export type ComponentCategory =
  | 'Layout'
  | 'Form'
  | 'Navigation'
  | 'Data'
  | 'Feedback';

export type EditorMode = 'grid' | 'text';

export type ToolMode = 'select' | 'draw' | 'erase' | 'box-select';

export interface CanvasSize {
  cols: number;
  rows: number;
  label: string;
  desc?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  cols: number;
  rows: number;
}

export interface EditorState {
  grid: string[][];
  cols: number;
  rows: number;
}

export interface HistoryEntry {
  grid: string[][];
  cols: number;
  rows: number;
}

export const CANVAS_PRESETS: CanvasSize[] = [
  { cols: 160, rows: 42, label: 'Desktop HD', desc: '16:9 · 1920×1080' },
  { cols: 120, rows: 36, label: 'Laptop', desc: '16:10 · 1440×900' },
  { cols: 100, rows: 38, label: 'Tablet Landscape', desc: '4:3 · 1024×768' },
  { cols: 64, rows: 50, label: 'Tablet Portrait', desc: '3:4 · 768×1024' },
  { cols: 44, rows: 78, label: 'Mobile Portrait', desc: '9:19.5 · 390×844' },
  { cols: 80, rows: 24, label: 'Terminal', desc: '80×24 standard' },
];

export const DEFAULT_CANVAS: CanvasSize = CANVAS_PRESETS[1];

export function createEmptyGrid(cols: number, rows: number): string[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ' ')
  );
}

export function gridToText(grid: string[][]): string {
  return grid.map((row) => row.join('')).join('\n');
}

export function textToGrid(text: string, cols: number, rows: number): string[][] {
  const lines = text.split('\n');
  const grid = createEmptyGrid(cols, rows);
  for (let r = 0; r < rows; r++) {
    const line = lines[r] || '';
    for (let c = 0; c < cols; c++) {
      grid[r][c] = c < line.length ? line[c] : ' ';
    }
  }
  return grid;
}

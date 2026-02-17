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

export type ToolMode = 'select' | 'draw' | 'erase';

export interface CanvasSize {
  cols: number;
  rows: number;
  label: string;
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
  { cols: 60, rows: 20, label: '60×20' },
  { cols: 80, rows: 24, label: '80×24' },
  { cols: 120, rows: 40, label: '120×40' },
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

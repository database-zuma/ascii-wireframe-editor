import { HistoryEntry } from './types';

const MAX_HISTORY = 50;

export interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry;
  future: HistoryEntry[];
}

function cloneEntry(entry: HistoryEntry): HistoryEntry {
  return {
    grid: entry.grid.map((row) => [...row]),
    cols: entry.cols,
    rows: entry.rows,
  };
}

export function createHistory(initial: HistoryEntry): HistoryState {
  return {
    past: [],
    present: cloneEntry(initial),
    future: [],
  };
}

export function pushState(history: HistoryState, entry: HistoryEntry): HistoryState {
  const past = [...history.past, cloneEntry(history.present)];
  if (past.length > MAX_HISTORY) {
    past.shift();
  }
  return {
    past,
    present: cloneEntry(entry),
    future: [],
  };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const prev = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: cloneEntry(prev),
    future: [cloneEntry(history.present), ...history.future],
  };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  return {
    past: [...history.past, cloneEntry(history.present)],
    present: cloneEntry(next),
    future: history.future.slice(1),
  };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}

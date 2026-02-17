'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  EditorMode,
  ToolMode,
  AsciiComponent,
  Template,
  DEFAULT_CANVAS,
  createEmptyGrid,
  gridToText,
  textToGrid,
} from '@/lib/types';
import {
  HistoryState,
  createHistory,
  pushState,
  undo as historyUndo,
  redo as historyRedo,
  canUndo as checkCanUndo,
  canRedo as checkCanRedo,
} from '@/lib/history';
import Toolbar from './Toolbar';
import Palette from './Palette';
import GridCanvas from './GridCanvas';
import TextEditor from './TextEditor';
import TemplateModal from './TemplateModal';

export interface SelectionRect {
  startR: number;
  startC: number;
  endR: number;
  endC: number;
}

export default function Editor() {
  const [cols, setCols] = useState(DEFAULT_CANVAS.cols);
  const [rows, setRows] = useState(DEFAULT_CANVAS.rows);
  const [history, setHistory] = useState<HistoryState>(() =>
    createHistory({
      grid: createEmptyGrid(DEFAULT_CANVAS.cols, DEFAULT_CANVAS.rows),
      cols: DEFAULT_CANVAS.cols,
      rows: DEFAULT_CANVAS.rows,
    })
  );
  const [mode, setMode] = useState<EditorMode>('grid');
  const [tool, setTool] = useState<ToolMode>('select');
  const [drawChar, setDrawChar] = useState('#');
  const [selectedComponent, setSelectedComponent] = useState<AsciiComponent | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [textBuffer, setTextBuffer] = useState('');

  // Zoom state
  const [zoom, setZoom] = useState(100);
  const mainRef = useRef<HTMLDivElement>(null);

  // Selection state
  const [selection, setSelection] = useState<SelectionRect | null>(null);

  // Fit menu state
  const [showFitMenu, setShowFitMenu] = useState(false);
  const fitRef = useRef<HTMLDivElement>(null);

  const grid = history.present.grid;

  const handleModeChange = useCallback(
    (next: EditorMode) => {
      if (next === mode) return;
      if (next === 'text') {
        setTextBuffer(gridToText(grid));
      } else {
        const newGrid = textToGrid(textBuffer, cols, rows);
        setHistory((h) => pushState(h, { grid: newGrid, cols, rows }));
      }
      setMode(next);
    },
    [mode, grid, textBuffer, cols, rows]
  );

  const handleGridChange = useCallback(
    (newGrid: string[][]) => {
      setHistory((h) => pushState(h, { grid: newGrid, cols, rows }));
    },
    [cols, rows]
  );

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      const next = historyUndo(h);
      if (next.present.cols !== cols) setCols(next.present.cols);
      if (next.present.rows !== rows) setRows(next.present.rows);
      return next;
    });
  }, [cols, rows]);

  const handleRedo = useCallback(() => {
    setHistory((h) => {
      const next = historyRedo(h);
      if (next.present.cols !== cols) setCols(next.present.cols);
      if (next.present.rows !== rows) setRows(next.present.rows);
      return next;
    });
  }, [cols, rows]);

  const handleCopy = useCallback(() => {
    const header = `// ASCII Wireframe - Created with ASCII Wireframe Editor\n// Canvas: ${cols}x${rows}\n\n`;
    const content = mode === 'text' ? textBuffer : gridToText(grid);
    const trimmed = content
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n')
      .replace(/\n+$/, '');
    navigator.clipboard.writeText(header + trimmed);
  }, [grid, mode, textBuffer, cols, rows]);

  const handleDownload = useCallback(() => {
    const header = `// ASCII Wireframe - Created with ASCII Wireframe Editor\n// Canvas: ${cols}x${rows}\n\n`;
    const content = mode === 'text' ? textBuffer : gridToText(grid);
    const trimmed = content
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n')
      .replace(/\n+$/, '');
    const blob = new Blob([header + trimmed], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `wireframe-${ts}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [grid, mode, textBuffer, cols, rows]);

  const handleClear = useCallback(() => {
    const empty = createEmptyGrid(cols, rows);
    setHistory((h) => pushState(h, { grid: empty, cols, rows }));
    if (mode === 'text') setTextBuffer(gridToText(empty));
  }, [cols, rows, mode]);

  const handleCanvasResize = useCallback(
    (newCols: number, newRows: number) => {
      const newGrid = createEmptyGrid(newCols, newRows);
      for (let r = 0; r < Math.min(rows, newRows); r++) {
        for (let c = 0; c < Math.min(cols, newCols); c++) {
          newGrid[r][c] = grid[r][c];
        }
      }
      setCols(newCols);
      setRows(newRows);
      setHistory((h) =>
        pushState(h, { grid: newGrid, cols: newCols, rows: newRows })
      );
      if (mode === 'text') setTextBuffer(gridToText(newGrid));
    },
    [grid, cols, rows, mode]
  );

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      const tCols = Math.max(cols, template.cols);
      const tRows = Math.max(rows, template.rows);
      const newGrid = textToGrid(template.content, tCols, tRows);
      setCols(tCols);
      setRows(tRows);
      setHistory((h) =>
        pushState(h, { grid: newGrid, cols: tCols, rows: tRows })
      );
      if (mode === 'text') setTextBuffer(gridToText(newGrid));
    },
    [cols, rows, mode]
  );

  const handleComponentPlaced = useCallback(() => {
    setSelectedComponent(null);
  }, []);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(300, z + 10)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(25, z - 10)), []);
  const handleZoomReset = useCallback(() => setZoom(100), []);

  const handleFitToWidth = useCallback(() => {
    if (!mainRef.current) return;
    const containerW = mainRef.current.clientWidth - 32;
    const canvasW = 28 + cols * 9.6;
    setZoom(Math.round(Math.min(300, Math.max(25, (containerW / canvasW) * 100))));
  }, [cols]);

  const handleFitToHeight = useCallback(() => {
    if (!mainRef.current) return;
    const containerH = mainRef.current.clientHeight - 32;
    const canvasH = 20 + rows * 20;
    setZoom(Math.round(Math.min(300, Math.max(25, (containerH / canvasH) * 100))));
  }, [rows]);

  const handleFitAll = useCallback(() => {
    if (!mainRef.current) return;
    const containerW = mainRef.current.clientWidth - 32;
    const containerH = mainRef.current.clientHeight - 32;
    const canvasW = 28 + cols * 9.6;
    const canvasH = 20 + rows * 20;
    const fitW = (containerW / canvasW) * 100;
    const fitH = (containerH / canvasH) * 100;
    setZoom(Math.round(Math.min(300, Math.max(25, Math.min(fitW, fitH)))));
  }, [cols, rows]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => Math.min(300, z + 10));
        return;
      }
      if (mod && e.key === '-') {
        e.preventDefault();
        setZoom((z) => Math.max(25, z - 10));
        return;
      }
      if (mod && e.key === '0') {
        e.preventDefault();
        setZoom(100);
        return;
      }
      if (mod && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        if (!mainRef.current) return;
        const containerW = mainRef.current.clientWidth - 32;
        const canvasW = 28 + cols * 9.6;
        setZoom(Math.round(Math.min(300, Math.max(25, (containerW / canvasW) * 100))));
        return;
      }

      if (!isInput && selection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        const g = grid.map((row) => [...row]);
        const r1 = Math.min(selection.startR, selection.endR);
        const r2 = Math.max(selection.startR, selection.endR);
        const c1 = Math.min(selection.startC, selection.endC);
        const c2 = Math.max(selection.startC, selection.endC);
        for (let r = r1; r <= r2; r++) {
          for (let c = c1; c <= c2; c++) {
            if (r < rows && c < cols) g[r][c] = ' ';
          }
        }
        setHistory((h) => pushState(h, { grid: g, cols, rows }));
        return;
      }
      if (e.key === 'Escape') {
        setSelection(null);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, grid, cols, rows]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.min(300, Math.max(25, z + (e.deltaY < 0 ? 10 : -10))));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fitRef.current && !fitRef.current.contains(e.target as Node)) {
        setShowFitMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="editor-root">
      <Toolbar
        mode={mode}
        onModeChange={handleModeChange}
        tool={tool}
        onToolChange={setTool}
        drawChar={drawChar}
        onDrawCharChange={setDrawChar}
        canUndo={checkCanUndo(history)}
        canRedo={checkCanRedo(history)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onClear={handleClear}
        onCanvasResize={handleCanvasResize}
        onOpenTemplates={() => setShowTemplates(true)}
        cols={cols}
        rows={rows}
      />

      <div className="editor-body">
        {mode === 'grid' && (
          <Palette
            selectedComponent={selectedComponent}
            onSelect={setSelectedComponent}
            collapsed={paletteCollapsed}
            onToggleCollapsed={() => setPaletteCollapsed((p) => !p)}
          />
        )}

        <main className="editor-main" ref={mainRef}>
          {mode === 'grid' ? (
            <GridCanvas
              grid={grid}
              cols={cols}
              rows={rows}
              selectedComponent={selectedComponent}
              tool={tool}
              drawChar={drawChar}
              onGridChange={handleGridChange}
              onComponentPlaced={handleComponentPlaced}
              zoom={zoom}
              selection={selection}
              onSelectionChange={setSelection}
            />
          ) : (
            <TextEditor
              text={textBuffer}
              onChange={setTextBuffer}
              cols={cols}
              rows={rows}
              zoom={zoom}
            />
          )}
        </main>
      </div>

      <footer className="status-bar">
        <div className="status-bar-left">
          <button className="status-copy-btn" onClick={handleCopy}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Copy Markdown
          </button>
          <button className="status-icon-btn" onClick={handleDownload} title="Download .txt">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="status-bar-center">
          <div className="status-separator" />
          <span>{cols}&times;{rows}</span>
          <div className="status-separator" />
        </div>

        <div className="status-bar-right">
          <div className="fit-wrapper" ref={fitRef}>
            <button className="fit-btn" onClick={() => setShowFitMenu((v) => !v)}>
              Fit
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
            {showFitMenu && (
              <div className="fit-menu">
                <button onClick={() => { handleFitToWidth(); setShowFitMenu(false); }}>Fit to Width</button>
                <button onClick={() => { handleFitToHeight(); setShowFitMenu(false); }}>Fit to Height</button>
                <button onClick={() => { handleFitAll(); setShowFitMenu(false); }}>Fit All</button>
                <button onClick={() => { handleZoomReset(); setShowFitMenu(false); }}>Actual Size (100%)</button>
              </div>
            )}
          </div>
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={handleZoomOut} disabled={zoom <= 25} title="Zoom out (Ctrl+−)">−</button>
            <button className="zoom-display" onClick={handleZoomReset} title="Reset zoom (Ctrl+0)">{zoom}%</button>
            <button className="zoom-btn" onClick={handleZoomIn} disabled={zoom >= 300} title="Zoom in (Ctrl++)">+</button>
          </div>
        </div>
      </footer>

      <TemplateModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
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

        <main className="editor-main">
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
            />
          ) : (
            <TextEditor
              text={textBuffer}
              onChange={setTextBuffer}
              cols={cols}
              rows={rows}
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
        </div>
        <div className="status-bar-right">
          <span>{cols}&times;{rows}</span>
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

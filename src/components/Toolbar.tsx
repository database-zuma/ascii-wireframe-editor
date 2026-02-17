'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { EditorMode, ToolMode, CANVAS_PRESETS } from '@/lib/types';

interface ToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  drawChar: string;
  onDrawCharChange: (ch: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onClear: () => void;
  onCanvasResize: (cols: number, rows: number) => void;
  onOpenTemplates: () => void;
  cols: number;
  rows: number;
}

export default function Toolbar({
  mode,
  onModeChange,
  tool,
  onToolChange,
  drawChar,
  onDrawCharChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCopy,
  onDownload,
  onClear,
  onCanvasResize,
  onOpenTemplates,
  cols,
  rows,
}: ToolbarProps) {
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [customCols, setCustomCols] = useState(String(cols));
  const [customRows, setCustomRows] = useState(String(rows));
  const [toast, setToast] = useState<string | null>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomCols(String(cols));
    setCustomRows(String(rows));
  }, [cols, rows]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
        setShowSizeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  function handleCopy() {
    onCopy();
    showToast('Copied to clipboard');
  }

  function handleDownload() {
    onDownload();
    showToast('Downloaded wireframe.txt');
  }

  function applyCustomSize() {
    const c = Math.max(20, Math.min(200, parseInt(customCols) || 80));
    const r = Math.max(5, Math.min(100, parseInt(customRows) || 24));
    onCanvasResize(c, r);
    setShowSizeMenu(false);
  }

  const matchingPreset = CANVAS_PRESETS.find((p) => p.cols === cols && p.rows === rows);
  const currentLabel = matchingPreset ? matchingPreset.label : `${cols}×${rows}`;

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <div className="toolbar-brand">
          <span className="brand-icon">◻</span>
          <span className="brand-text">ASCII Wireframe</span>
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'grid' ? 'active' : ''}`}
            onClick={() => onModeChange('grid')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1" y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Grid
          </button>
          <button
            className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => onModeChange('text')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3h10M2 7h7M2 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Text
          </button>
        </div>

        {mode === 'grid' && (
          <div className="tool-group">
            <button
              className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
              onClick={() => onToolChange('select')}
              title="Select / Place component"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l4.5 10 1.5-4 4-1.5L2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className={`tool-btn ${tool === 'box-select' ? 'active' : ''}`}
              onClick={() => onToolChange('box-select')}
              title="Box select / Region"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
              </svg>
            </button>
            <button
              className={`tool-btn ${tool === 'draw' ? 'active' : ''}`}
              onClick={() => onToolChange('draw')}
              title="Freehand draw"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8.5 2.5l3 3M2 9l6.5-6.5 3 3L5 12H2V9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className={`tool-btn ${tool === 'erase' ? 'active' : ''}`}
              onClick={() => onToolChange('erase')}
              title="Eraser"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 12h7M3.5 9.5l5-5 3 3-5 5-3.5-.5.5-2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
            {tool === 'draw' && (
              <input
                className="char-input"
                type="text"
                maxLength={1}
                value={drawChar}
                onChange={(e) => onDrawCharChange(e.target.value || '#')}
                title="Draw character"
              />
            )}
          </div>
        )}
      </div>

      <div className="toolbar-right">
        <div className="tool-group">
          <button className="tool-btn" onClick={onUndo} disabled={!canUndo} title="Undo">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5h6a3 3 0 0 1 0 6H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 3L3 5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="tool-btn" onClick={onRedo} disabled={!canRedo} title="Redo">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 5H5a3 3 0 0 0 0 6h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M9 3l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="size-wrapper" ref={sizeRef}>
          <button className="tool-btn size-btn" onClick={() => setShowSizeMenu(!showSizeMenu)}>
            {currentLabel}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
          {showSizeMenu && (
            <div className="size-menu">
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.label}
                  className={`size-option ${p.cols === cols && p.rows === rows ? 'active' : ''}`}
                  onClick={() => {
                    onCanvasResize(p.cols, p.rows);
                    setShowSizeMenu(false);
                  }}
                >
                  <span className="size-option-label">{p.label}</span>
                  {p.desc && <span className="size-option-desc">{p.desc}</span>}
                </button>
              ))}
              <div className="size-custom">
                <input
                  type="number"
                  value={customCols}
                  onChange={(e) => setCustomCols(e.target.value)}
                  min={20}
                  max={200}
                  placeholder="cols"
                />
                <span>×</span>
                <input
                  type="number"
                  value={customRows}
                  onChange={(e) => setCustomRows(e.target.value)}
                  min={5}
                  max={100}
                  placeholder="rows"
                />
                <button onClick={applyCustomSize}>Set</button>
              </div>
            </div>
          )}
        </div>

        <button className="tool-btn" onClick={onOpenTemplates} title="Templates">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="1.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1.5 5h11M5.5 5v7.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>

        <div className="divider-v" />

        <button className="tool-btn" onClick={handleCopy} title="Copy to clipboard">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button className="tool-btn" onClick={handleDownload} title="Download .txt">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="tool-btn danger" onClick={onClear} title="Clear canvas">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </header>
  );
}

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { AsciiComponent, ToolMode } from '@/lib/types';

interface GridCanvasProps {
  grid: string[][];
  cols: number;
  rows: number;
  selectedComponent: AsciiComponent | null;
  tool: ToolMode;
  drawChar: string;
  onGridChange: (grid: string[][]) => void;
  onComponentPlaced: () => void;
}

const CELL_W = 9.6;
const CELL_H = 20;
const GUTTER = 28;

export default function GridCanvas({
  grid,
  cols,
  rows,
  selectedComponent,
  tool,
  drawChar,
  onGridChange,
  onComponentPlaced,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function cellFromEvent(e: React.MouseEvent): { r: number; c: number } | null {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scrollLeft = el.scrollLeft;
    const scrollTop = el.scrollTop;
    const x = e.clientX - rect.left + scrollLeft - GUTTER;
    const y = e.clientY - rect.top + scrollTop - CELL_H;
    const c = Math.floor(x / CELL_W);
    const r = Math.floor(y / CELL_H);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return { r, c };
  }

  function cloneGrid(): string[][] {
    return grid.map((row) => [...row]);
  }

  function placeComponent(r: number, c: number) {
    if (!selectedComponent) return;
    const g = cloneGrid();
    for (let lr = 0; lr < selectedComponent.lines.length; lr++) {
      const line = selectedComponent.lines[lr];
      for (let lc = 0; lc < line.length; lc++) {
        const tr = r + lr;
        const tc = c + lc;
        if (tr < rows && tc < cols) {
          g[tr][tc] = line[lc];
        }
      }
    }
    onGridChange(g);
    onComponentPlaced();
  }

  function paint(r: number, c: number) {
    const g = cloneGrid();
    g[r][c] = tool === 'erase' ? ' ' : drawChar;
    onGridChange(g);
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const cell = cellFromEvent(e);
      if (!cell) return;

      if (tool === 'select' && selectedComponent) {
        placeComponent(cell.r, cell.c);
        return;
      }

      if (tool === 'draw' || tool === 'erase') {
        setIsDrawing(true);
        paint(cell.r, cell.c);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, tool, selectedComponent, drawChar, cols, rows]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const cell = cellFromEvent(e);
      setHoverCell(cell);
      if (isDrawing && cell && (tool === 'draw' || tool === 'erase')) {
        paint(cell.r, cell.c);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDrawing, grid, tool, drawChar, cols, rows]
  );

  useEffect(() => {
    function handleUp() {
      setIsDrawing(false);
    }
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  const previewCells = new Set<string>();
  if (hoverCell && selectedComponent && tool === 'select') {
    for (let lr = 0; lr < selectedComponent.lines.length; lr++) {
      const line = selectedComponent.lines[lr];
      for (let lc = 0; lc < line.length; lc++) {
        const tr = hoverCell.r + lr;
        const tc = hoverCell.c + lc;
        if (tr < rows && tc < cols && line[lc] !== ' ') {
          previewCells.add(`${tr},${tc}`);
        }
      }
    }
  }

  const cursorClass =
    tool === 'draw'
      ? 'cursor-draw'
      : tool === 'erase'
        ? 'cursor-erase'
        : selectedComponent
          ? 'cursor-place'
          : 'cursor-default';

  return (
    <div
      ref={containerRef}
      className={`grid-canvas ${cursorClass}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverCell(null)}
    >
      <div
        className="grid-inner"
        style={{
          width: GUTTER + cols * CELL_W + 2,
          height: CELL_H + rows * CELL_H + 2,
        }}
      >
        {/* Column numbers */}
        <div className="grid-col-nums" style={{ paddingLeft: GUTTER }}>
          {Array.from({ length: cols }, (_, c) =>
            c % 10 === 0 ? (
              <span
                key={c}
                className="col-num"
                style={{ left: GUTTER + c * CELL_W, width: CELL_W }}
              >
                {c}
              </span>
            ) : null
          )}
        </div>

        {/* Rows */}
        {grid.map((row, r) => (
          <div key={r} className="grid-row" style={{ height: CELL_H }}>
            <span className="row-num" style={{ width: GUTTER }}>
              {r}
            </span>
            {row.map((ch, c) => {
              const isHover = hoverCell?.r === r && hoverCell?.c === c;
              const isPreview = previewCells.has(`${r},${c}`);
              const isBoxChar = '┌┐└┘│─├┤┬┴┼╔╗╚╝║═╠╣╦╩╬'.includes(ch);
              let cls = 'grid-cell';
              if (isHover) cls += ' hover';
              if (isPreview) cls += ' preview';
              if (isBoxChar) cls += ' box-char';
              if (ch !== ' ') cls += ' filled';

              return (
                <span
                  key={c}
                  className={cls}
                  style={{ width: CELL_W, height: CELL_H }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}

        {/* Crosshair */}
        {hoverCell && (
          <>
            <div
              className="crosshair-h"
              style={{
                top: CELL_H + hoverCell.r * CELL_H + CELL_H / 2,
                left: GUTTER,
                width: cols * CELL_W,
              }}
            />
            <div
              className="crosshair-v"
              style={{
                left: GUTTER + hoverCell.c * CELL_W + CELL_W / 2,
                top: CELL_H,
                height: rows * CELL_H,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

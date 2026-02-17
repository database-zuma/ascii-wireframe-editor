'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { AsciiComponent, ToolMode } from '@/lib/types';
import type { SelectionRect } from './Editor';

interface GridCanvasProps {
  grid: string[][];
  cols: number;
  rows: number;
  selectedComponent: AsciiComponent | null;
  tool: ToolMode;
  drawChar: string;
  onGridChange: (grid: string[][]) => void;
  onComponentPlaced: () => void;
  zoom: number;
  selection: SelectionRect | null;
  onSelectionChange: (sel: SelectionRect | null) => void;
}

const BASE_CELL_W = 9.6;
const BASE_CELL_H = 20;
const BASE_GUTTER = 28;

export default function GridCanvas({
  grid,
  cols,
  rows,
  selectedComponent,
  tool,
  drawChar,
  onGridChange,
  onComponentPlaced,
  zoom,
  selection,
  onSelectionChange,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [dragStart, setDragStart] = useState<{ r: number; c: number } | null>(null);

  const scale = zoom / 100;
  const cellW = BASE_CELL_W * scale;
  const cellH = BASE_CELL_H * scale;
  const gutter = BASE_GUTTER * scale;
  const fontSize = 13 * scale;
  const numFontSize = Math.max(7, 9 * scale);

  function cellFromEvent(e: React.MouseEvent): { r: number; c: number } | null {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scrollLeft = el.scrollLeft;
    const scrollTop = el.scrollTop;
    const x = e.clientX - rect.left + scrollLeft - gutter;
    const y = e.clientY - rect.top + scrollTop - cellH;
    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellH);
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

      if (tool === 'box-select') {
        setIsDraggingSelection(true);
        setDragStart(cell);
        onSelectionChange({ startR: cell.r, startC: cell.c, endR: cell.r, endC: cell.c });
        return;
      }

      if (selection) {
        const r1 = Math.min(selection.startR, selection.endR);
        const r2 = Math.max(selection.startR, selection.endR);
        const c1 = Math.min(selection.startC, selection.endC);
        const c2 = Math.max(selection.startC, selection.endC);
        if (cell.r < r1 || cell.r > r2 || cell.c < c1 || cell.c > c2) {
          onSelectionChange(null);
        }
      }

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
    [grid, tool, selectedComponent, drawChar, cols, rows, selection, zoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const cell = cellFromEvent(e);
      setHoverCell(cell);
      if (isDraggingSelection && dragStart && cell && tool === 'box-select') {
        onSelectionChange({ startR: dragStart.r, startC: dragStart.c, endR: cell.r, endC: cell.c });
        return;
      }
      if (isDrawing && cell && (tool === 'draw' || tool === 'erase')) {
        paint(cell.r, cell.c);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDrawing, isDraggingSelection, dragStart, grid, tool, drawChar, cols, rows, zoom]
  );

  useEffect(() => {
    function handleUp() {
      setIsDrawing(false);
      setIsDraggingSelection(false);
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

  const selR1 = selection ? Math.min(selection.startR, selection.endR) : -1;
  const selR2 = selection ? Math.max(selection.startR, selection.endR) : -1;
  const selC1 = selection ? Math.min(selection.startC, selection.endC) : -1;
  const selC2 = selection ? Math.max(selection.startC, selection.endC) : -1;

  const cursorClass =
    tool === 'box-select'
      ? 'cursor-box-select'
      : tool === 'draw'
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
          width: gutter + cols * cellW + 2,
          height: cellH + rows * cellH + 2,
        }}
      >
        <div className="grid-col-nums" style={{ paddingLeft: gutter, height: cellH }}>
          {Array.from({ length: cols }, (_, c) =>
            c % 10 === 0 ? (
              <span
                key={c}
                className="col-num"
                style={{ left: gutter + c * cellW, width: cellW, fontSize: numFontSize + 'px' }}
              >
                {c}
              </span>
            ) : null
          )}
        </div>

        {grid.map((row, r) => (
          <div key={r} className="grid-row" style={{ height: cellH }}>
            <span className="row-num" style={{ width: gutter, fontSize: numFontSize + 'px' }}>
              {r}
            </span>
            {row.map((ch, c) => {
              const isHover = hoverCell?.r === r && hoverCell?.c === c;
              const isPreview = previewCells.has(`${r},${c}`);
              const isBoxChar = '┌┐└┘│─├┤┬┴┼╔╗╚╝║═╠╣╦╩╬'.includes(ch);
              const inSelection = r >= selR1 && r <= selR2 && c >= selC1 && c <= selC2;
              let cls = 'grid-cell';
              if (isHover) cls += ' hover';
              if (isPreview) cls += ' preview';
              if (isBoxChar) cls += ' box-char';
              if (ch !== ' ') cls += ' filled';
              if (inSelection) cls += ' in-selection';

              return (
                <span
                  key={c}
                  className={cls}
                  style={{
                    width: cellW,
                    height: cellH,
                    fontSize: fontSize + 'px',
                    lineHeight: cellH + 'px',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}

        {hoverCell && (
          <>
            <div
              className="crosshair-h"
              style={{
                top: cellH + hoverCell.r * cellH + cellH / 2,
                left: gutter,
                width: cols * cellW,
              }}
            />
            <div
              className="crosshair-v"
              style={{
                left: gutter + hoverCell.c * cellW + cellW / 2,
                top: cellH,
                height: rows * cellH,
              }}
            />
          </>
        )}

        {selection && (
          <div
            className="selection-overlay"
            style={{
              left: gutter + selC1 * cellW,
              top: cellH + selR1 * cellH,
              width: (selC2 - selC1 + 1) * cellW,
              height: (selR2 - selR1 + 1) * cellH,
            }}
          />
        )}

        {isDraggingSelection && selection && hoverCell && (
          <div
            className="selection-size-tooltip"
            style={{
              left: gutter + hoverCell.c * cellW + cellW + 4,
              top: cellH + hoverCell.r * cellH - 8,
            }}
          >
            {Math.abs(selC2 - selC1) + 1}&times;{Math.abs(selR2 - selR1) + 1}
          </div>
        )}
      </div>
    </div>
  );
}

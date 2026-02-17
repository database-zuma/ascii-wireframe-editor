'use client';

import { useState } from 'react';
import { asciiComponents, categoryOrder } from '@/lib/ascii-components';
import { AsciiComponent } from '@/lib/types';

interface PaletteProps {
  selectedComponent: AsciiComponent | null;
  onSelect: (component: AsciiComponent | null) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Palette({
  selectedComponent,
  onSelect,
  collapsed,
  onToggleCollapsed,
}: PaletteProps) {
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(categoryOrder)
  );

  function toggleCategory(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const filtered = asciiComponents.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = categoryOrder.reduce<Record<string, AsciiComponent[]>>(
    (acc, cat) => {
      const items = filtered.filter((c) => c.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {}
  );

  return (
    <aside className={`palette ${collapsed ? 'collapsed' : ''}`}>
      <div className="palette-header">
        {!collapsed && <span className="palette-title">Components</span>}
        <button
          className="palette-toggle"
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand palette' : 'Collapse palette'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ transform: collapsed ? 'rotate(180deg)' : undefined }}
          >
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="palette-search">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8.5 8.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {selectedComponent && (
            <button className="deselect-btn" onClick={() => onSelect(null)}>
              ✕ Deselect {selectedComponent.name}
            </button>
          )}

          <div className="palette-list">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="palette-category">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(cat)}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    style={{
                      transform: expandedCats.has(cat) ? 'rotate(90deg)' : undefined,
                      transition: 'transform 0.15s',
                    }}
                  >
                    <path d="M3 1.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{cat}</span>
                  <span className="cat-count">{items.length}</span>
                </button>
                {expandedCats.has(cat) && (
                  <div className="category-items">
                    {items.map((comp) => (
                      <button
                        key={comp.id}
                        className={`comp-item ${selectedComponent?.id === comp.id ? 'selected' : ''}`}
                        onClick={() =>
                          onSelect(
                            selectedComponent?.id === comp.id ? null : comp
                          )
                        }
                      >
                        <span className="comp-name">{comp.name}</span>
                        <pre className="comp-preview">
                          {comp.lines.slice(0, 3).join('\n')}
                          {comp.lines.length > 3 ? '\n…' : ''}
                        </pre>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

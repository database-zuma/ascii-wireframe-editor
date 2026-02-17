'use client';

import { useRef, useCallback } from 'react';

interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  cols: number;
  rows: number;
  zoom: number;
}

export default function TextEditor({ text, onChange, cols, rows, zoom }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scale = zoom / 100;
  const scaledFontSize = 13 * scale;
  const scaledLineH = 20 * scale;

  const lines = text.split('\n');
  const lineCount = lines.length;
  const maxCol = lines.reduce((m, l) => Math.max(m, l.length), 0);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    const ln = document.getElementById('line-numbers');
    if (ta && ln) {
      ln.scrollTop = ta.scrollTop;
    }
  }, []);

  return (
    <div className="text-editor">
      <div className="text-editor-header">
        <span className="text-stats">
          {lineCount} lines · {maxCol} max cols · Canvas {cols}×{rows}
        </span>
      </div>
      <div className="text-editor-body">
        <div id="line-numbers" className="line-numbers">
          {Array.from({ length: Math.max(lineCount, rows) }, (_, i) => (
            <span
              key={i}
              className="line-num"
              style={{ fontSize: scaledFontSize, lineHeight: scaledLineH + 'px', height: scaledLineH }}
            >
              {i + 1}
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="text-area"
          value={text}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          style={{ fontSize: scaledFontSize, lineHeight: scaledLineH + 'px' }}
        />
      </div>
    </div>
  );
}

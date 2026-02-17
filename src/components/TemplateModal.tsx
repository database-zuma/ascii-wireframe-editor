'use client';

import { useState } from 'react';
import { templates } from '@/lib/templates';
import { Template } from '@/lib/types';

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export default function TemplateModal({ open, onClose, onSelect }: TemplateModalProps) {
  const [preview, setPreview] = useState<string | null>(null);

  if (!open) return null;

  const previewTemplate = preview
    ? templates.find((t) => t.id === preview)
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Templates</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="template-grid">
            {templates.map((t) => (
              <button
                key={t.id}
                className={`template-card ${preview === t.id ? 'selected' : ''}`}
                onClick={() => setPreview(t.id)}
                onDoubleClick={() => {
                  onSelect(t);
                  onClose();
                }}
              >
                <span className="template-name">{t.name}</span>
                <span className="template-desc">{t.description}</span>
                <span className="template-size">
                  {t.cols}×{t.rows}
                </span>
              </button>
            ))}
          </div>

          {previewTemplate && (
            <div className="template-preview">
              <div className="preview-header">
                <span>{previewTemplate.name}</span>
                <span className="preview-size">
                  {previewTemplate.cols}×{previewTemplate.rows}
                </span>
              </div>
              <pre className="preview-content">{previewTemplate.content}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            disabled={!previewTemplate}
            onClick={() => {
              if (previewTemplate) {
                onSelect(previewTemplate);
                onClose();
              }
            }}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

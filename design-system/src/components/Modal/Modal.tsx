import React from 'react';
import './Modal.css';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Rendered right-aligned at the bottom (typically Cancel + primary Button). */
  actions?: React.ReactNode;
  /** `default` follows the app's dark/light theme; `paper` is the fixed
   * cream surface used for notes/edit-word dialogs; `danger` adds a warn
   * border for destructive confirmations.
   * @default 'default' */
  tone?: 'default' | 'paper' | 'danger';
}

/** The centered overlay dialog shell used for every modal in the app —
 * bulk import, AI prompt, notebook editor, delete confirmation, etc. */
export function Modal({ open, onClose, title, description, children, actions, tone = 'default' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="tt-modal__overlay" onClick={onClose}>
      <div
        className={`tt-modal__panel tt-modal__panel--${tone}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && <div className="tt-modal__title">{title}</div>}
        {description && <div className="tt-modal__description">{description}</div>}
        {children}
        {actions && <div className="tt-modal__actions">{actions}</div>}
      </div>
    </div>
  );
}

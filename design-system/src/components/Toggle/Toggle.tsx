import React from 'react';
import './Toggle.css';

export interface ToggleProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  label: React.ReactNode;
  /** `inline` is a bare checkbox + label row (e.g. dictation mode); `chip` is
   * a bordered pill-like filter chip (e.g. "★ favorites only").
   * @default 'inline' */
  variant?: 'inline' | 'chip';
}

/** A labeled checkbox toggle used for mode switches and list filters. */
export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, variant = 'inline', className, id, ...rest }, ref) => {
    const inputId = id ?? React.useId();
    const classes = ['tt-toggle', `tt-toggle--${variant}`, className].filter(Boolean).join(' ');
    return (
      <label htmlFor={inputId} className={classes}>
        <input ref={ref} id={inputId} type="checkbox" className="tt-toggle__input" {...rest} />
        <span className="tt-toggle__label">{label}</span>
      </label>
    );
  }
);
Toggle.displayName = 'Toggle';

import React from 'react';
import './IconButton.css';

export interface IconButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /** `square` is the 1.5px-bordered square used on the practice card
   * (favorite/notes/restart); `soft-circle` is the tinted circular button
   * used in the header (theme toggle). */
  variant?: 'square' | 'soft-circle';
  /** Accessible label — also used as the native `title` tooltip when no
   * `title` prop is supplied. */
  label: string;
  /** @default 'md' */
  size?: 'sm' | 'md';
}

/** A single-glyph icon button (favorite ★, notes ✎, restart ↻, theme ☾/☀). */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'square', size = 'md', label, title, className, children, ...rest }, ref) => {
    const classes = ['tt-icon-button', `tt-icon-button--${variant}`, `tt-icon-button--${size}`, className]
      .filter(Boolean)
      .join(' ');
    return (
      <button ref={ref} className={classes} aria-label={label} title={title ?? label} {...rest}>
        {children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

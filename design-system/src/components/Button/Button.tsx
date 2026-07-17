import React from 'react';
import './Button.css';

export type ButtonVariant =
  | 'accent'
  | 'invert'
  | 'outline'
  | 'dashed'
  | 'ghost'
  | 'danger'
  | 'danger-solid';

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Visual treatment. `accent` is the primary call-to-action; `invert` is the
   * pill-shaped inverted button used for identity/account controls; `dashed`
   * is used for prev/next-style navigation; `danger`/`danger-solid` are for
   * destructive actions. */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: 'sm' | 'md';
}

/**
 * TYPE/TRAINER's core button. Renders as an unstyled-reset `<button>` styled
 * with the design system's tokens — never a native browser button look.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'accent', size = 'md', className, children, ...rest }, ref) => {
    const classes = ['tt-button', `tt-button--${variant}`, `tt-button--${size}`, className]
      .filter(Boolean)
      .join(' ');
    return (
      <button ref={ref} className={classes} {...rest}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

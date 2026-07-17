import React from 'react';
import './Badge.css';

export interface BadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  /** @default 'default' */
  tone?: 'default' | 'accent';
}

/** Small mono-font counter badge (e.g. `NO.001`, page/index markers). */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ tone = 'default', className, children, ...rest }, ref) => {
    const classes = ['tt-badge', `tt-badge--${tone}`, className].filter(Boolean).join(' ');
    return (
      <span ref={ref} className={classes} {...rest}>
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

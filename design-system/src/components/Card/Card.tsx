import React from 'react';
import './Card.css';

export interface CardProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  /** Small uppercase label above the content (e.g. "이번 세션", "즐겨찾기"). */
  title?: React.ReactNode;
}

/** A bordered, rounded panel used for sidebar stat blocks and grouped
 * settings — the app's basic content-grouping surface. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, className, children, ...rest }, ref) => {
    const classes = ['tt-card', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {title && <div className="tt-card__title">{title}</div>}
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

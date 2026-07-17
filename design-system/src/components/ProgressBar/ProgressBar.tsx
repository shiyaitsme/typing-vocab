import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  label?: React.ReactNode;
}

/** The thin accent-filled progress track used for mastery/completion. */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, label, className, ...rest }, ref) => {
    const pct = Math.max(0, Math.min(100, value));
    const classes = ['tt-progress-bar', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        <div className="tt-progress-bar__track">
          <div className="tt-progress-bar__fill" style={{ width: `${pct}%` }} />
        </div>
        {label && <div className="tt-progress-bar__label">{label}</div>}
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';

import React from 'react';
import './TextInput.css';

export interface TextInputProps extends React.ComponentPropsWithoutRef<'input'> {
  /** `dark` sits on the app's dark/light background surfaces; `paper` sits
   * inside the cream practice card and other paper-toned surfaces.
   * @default 'dark' */
  surface?: 'dark' | 'paper';
  /** Centers the text — used for the mobile typing input and name prompts.
   * @default false */
  centered?: boolean;
}

/** A single-line text field styled to the design system's tokens. */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ surface = 'dark', centered = false, className, ...rest }, ref) => {
    const classes = [
      'tt-text-input',
      `tt-text-input--${surface}`,
      centered && 'tt-text-input--centered',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return <input ref={ref} type="text" className={classes} autoComplete="off" {...rest} />;
  }
);
TextInput.displayName = 'TextInput';

import React from 'react';
import './AppHeader.css';

export interface AppHeaderProps {
  /** Defaults to the "TYPE/TRAINER" wordmark with an accent-colored slash. */
  logo?: React.ReactNode;
  tagline?: React.ReactNode;
  /** Practice-mode switch — typically a `<TabGroup variant="glyph">`. */
  centerSlot?: React.ReactNode;
  /** Text navigation links. */
  navSlot?: React.ReactNode;
  /** Right-aligned controls — theme toggle, language switch, user pill. */
  actionsSlot?: React.ReactNode;
}

const defaultLogo = (
  <span className="tt-app-header__logo">
    TYPE<span className="tt-app-header__logo-accent">/</span>TRAINER
  </span>
);

/** The sticky top navigation bar: wordmark + tagline, a practice-mode
 * switch, text nav links, and right-aligned controls. */
export function AppHeader({ logo = defaultLogo, tagline, centerSlot, navSlot, actionsSlot }: AppHeaderProps) {
  return (
    <header className="tt-app-header">
      <div className="tt-app-header__brand">
        {logo}
        {tagline && <div className="tt-app-header__tagline">{tagline}</div>}
      </div>
      {centerSlot && <div className="tt-app-header__center">{centerSlot}</div>}
      {navSlot && <nav className="tt-app-header__nav">{navSlot}</nav>}
      {actionsSlot && <div className="tt-app-header__actions">{actionsSlot}</div>}
    </header>
  );
}

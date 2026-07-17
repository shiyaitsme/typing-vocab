import React from 'react';
import './TabGroup.css';

export interface TabGroupItem {
  value: string;
  label: React.ReactNode;
}

export interface TabGroupProps {
  items: TabGroupItem[];
  value: string;
  onChange: (value: string) => void;
  /** `glyph` prefixes the active item with a filled ■ / hollow □ square (the
   * 한국어/english practice-mode switch); `segmented` is a pill-shaped
   * container with one solid active pill inside it (the KO/EN interface
   * switch); `chips` renders each item as its own independent pill button
   * (date filters, notebook filters).
   * @default 'chips' */
  variant?: 'glyph' | 'segmented' | 'chips';
  className?: string;
}

/** A group of mutually-exclusive text tabs, in one of three shipped looks. */
export function TabGroup({ items, value, onChange, variant = 'chips', className }: TabGroupProps) {
  const classes = ['tt-tab-group', `tt-tab-group--${variant}`, className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="tablist">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active || undefined}
            className="tt-tab-group__item"
            onClick={() => onChange(item.value)}
          >
            {variant === 'glyph' && (
              <span className="tt-tab-group__glyph">{active ? '■' : '□'}</span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';
import './CharacterTile.css';

export type CharacterTileTone = 'pending' | 'active' | 'correct' | 'incorrect';
export type CharacterTileSlot = 'empty' | 'ok' | 'bad';

export interface CharacterTileProps {
  /** The character/glyph to display. Pass `''` for a not-yet-revealed slot. */
  text: string;
  /** Small caption rendered above the glyph (used for input hints). */
  hint?: string;
  /** @default 'pending' */
  tone?: CharacterTileTone;
  /** `dashes` renders one short dash per jamo slot (한국어 syllables, tracking
   * 초성/중성/종성 individually); `bar` renders a single underline (english
   * letters). @default 'bar' */
  underline?: 'dashes' | 'bar';
  /** Per-slot state, only used when `underline="dashes"`. Defaults to a
   * single empty slot. */
  slots?: CharacterTileSlot[];
  /** `ko` is sized for Hangul syllables, `en` for individual Latin letters.
   * @default 'ko' */
  size?: 'ko' | 'en';
}

/** One character cell of the typing row — the practice card's signature
 * unit, colored by whether it's untyped, in progress, correct, or wrong. */
export function CharacterTile({
  text,
  hint,
  tone = 'pending',
  underline = 'bar',
  slots,
  size = 'ko',
}: CharacterTileProps) {
  const resolvedSlots = slots ?? ['empty'];
  return (
    <div className={`tt-character-tile tt-character-tile--${size}`}>
      {hint && <div className="tt-character-tile__hint">{hint}</div>}
      <div className={`tt-character-tile__glyph tt-character-tile__glyph--${tone}`}>{text}</div>
      {underline === 'dashes' ? (
        <div className="tt-character-tile__dashes">
          {resolvedSlots.map((slot, i) => (
            <div key={i} className={`tt-character-tile__dash tt-character-tile__dash--${slot}`} />
          ))}
        </div>
      ) : (
        <div className={`tt-character-tile__bar tt-character-tile__bar--${tone}`} />
      )}
    </div>
  );
}

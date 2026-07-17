import React from 'react';
import { CharacterTile } from '@typing-vocab/design-system';

export function HangulSyllableStates() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-end',
        background: '#f2ede2',
        padding: 24,
        borderRadius: 4,
      }}
    >
      <CharacterTile text="연" tone="pending" underline="dashes" slots={['empty', 'empty', 'empty']} />
      <CharacterTile text="천" tone="active" underline="dashes" slots={['ok', 'empty', 'empty']} />
      <CharacterTile text="전" tone="correct" underline="dashes" slots={['ok', 'ok', 'empty']} />
      <CharacterTile
        text="곡"
        tone="incorrect"
        hint="곡"
        underline="dashes"
        slots={['ok', 'bad', 'empty']}
      />
    </div>
  );
}

export function EnglishLetterStates() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        background: '#f2ede2',
        padding: 24,
        borderRadius: 4,
      }}
    >
      <CharacterTile text="S" tone="correct" underline="bar" size="en" />
      <CharacterTile text="E" tone="correct" underline="bar" size="en" />
      <CharacterTile text="O" tone="incorrect" underline="bar" size="en" />
      <CharacterTile text="" tone="pending" underline="bar" size="en" />
      <CharacterTile text="" tone="pending" underline="bar" size="en" />
    </div>
  );
}

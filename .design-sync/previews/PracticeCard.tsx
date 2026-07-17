import React from 'react';
import { PracticeCard, CharacterTile } from '@typing-vocab/design-system';

export function InProgress() {
  return (
    <div style={{ background: '#0a0a0a', padding: 24, borderRadius: 4 }}>
      <PracticeCard
        counter="3 / 42"
        badge="NO.003"
        masteryFilled={2}
        romanization="Jeongok"
        tip="[PC] 영문 자판 그대로 타이핑 · Backspace 수정 · Enter 다음 단어"
        inputProps={{ placeholder: '여기를 눌러 입력을 시작하세요' }}
      >
        <CharacterTile text="전" tone="correct" underline="dashes" slots={['ok', 'ok', 'empty']} />
        <CharacterTile text="곡" tone="active" underline="dashes" slots={['ok', 'empty', 'empty']} />
      </PracticeCard>
    </div>
  );
}

export function WordComplete() {
  return (
    <div style={{ background: '#0a0a0a', padding: 24, borderRadius: 4 }}>
      <PracticeCard
        counter="12 / 42"
        badge="NO.012"
        masteryFilled={5}
        favoriteActive
        romanization="Seoul"
        statusText="정답! 다음 단어로"
        tip="[PC] 영문 자판 그대로 타이핑 · Backspace 수정 · Enter 다음 단어"
        inputProps={{ placeholder: '여기를 눌러 입력을 시작하세요' }}
      >
        <CharacterTile text="서" tone="correct" underline="dashes" slots={['ok', 'ok']} />
        <CharacterTile text="울" tone="correct" underline="dashes" slots={['ok', 'ok', 'ok']} />
      </PracticeCard>
    </div>
  );
}

import React from 'react';
import { IconButton } from '@typing-vocab/design-system';

export function PracticeCardActions() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        background: '#f2ede2',
        padding: 16,
        borderRadius: 4,
        color: '#0a0a0a',
      }}
    >
      <IconButton label="즐겨찾기" variant="square" style={{ color: '#0a0a0a' }}>
        ★
      </IconButton>
      <IconButton label="노트" variant="square" style={{ color: '#0a0a0a' }}>
        ✎
      </IconButton>
      <IconButton label="다시 시작" variant="square" style={{ color: '#0a0a0a' }}>
        ↻
      </IconButton>
    </div>
  );
}

export function HeaderTheme() {
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4 }}>
      <IconButton label="라이트 모드로 전환" variant="soft-circle">
        ☾
      </IconButton>
    </div>
  );
}

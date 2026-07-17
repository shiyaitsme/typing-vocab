import React from 'react';
import { ProgressBar } from '@typing-vocab/design-system';

export function Partial() {
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4, maxWidth: 260 }}>
      <ProgressBar value={62} label="24 / 42 단어 완전 숙달" />
    </div>
  );
}

export function Empty() {
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4, maxWidth: 260 }}>
      <ProgressBar value={0} label="아직 학습한 단어가 없습니다" />
    </div>
  );
}

export function Complete() {
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4, maxWidth: 260 }}>
      <ProgressBar value={100} label="42 / 42 단어 완전 숙달" />
    </div>
  );
}

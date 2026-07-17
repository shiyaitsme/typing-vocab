import React from 'react';
import { Card, ProgressBar } from '@typing-vocab/design-system';

export function SessionStats() {
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4, maxWidth: 260 }}>
      <Card title="이번 세션">
        <div style={{ color: '#f2ede2', fontSize: 13, fontWeight: 600, lineHeight: 1.8 }}>
          정답 24 · 스킵 3 · 정확도 92%
          <br />
          🔥 5연속
        </div>
      </Card>
    </div>
  );
}

export function MasteryProgress() {
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4, maxWidth: 260 }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>숙련도 진행</span>
            <span style={{ color: '#e3b8d6', fontFamily: 'monospace' }}>62%</span>
          </div>
        }
      >
        <ProgressBar value={62} label="24 / 42 단어 완전 숙달" />
      </Card>
    </div>
  );
}

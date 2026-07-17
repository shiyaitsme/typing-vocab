import React, { useState } from 'react';
import { Toggle } from '@typing-vocab/design-system';

export function Inline() {
  const [checked, setChecked] = useState(true);
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4 }}>
      <Toggle
        label="딕테이션 모드"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    </div>
  );
}

export function Chips() {
  return (
    <div style={{ display: 'flex', gap: 8, background: '#0a0a0a', padding: 16, borderRadius: 4 }}>
      <Toggle variant="chip" label="★ 즐겨찾기만" defaultChecked />
      <Toggle variant="chip" label="📝 노트만" />
      <Toggle variant="chip" label="❌ 오답만" />
    </div>
  );
}

import React from 'react';
import { Badge } from '@typing-vocab/design-system';

export function OnPaper() {
  return (
    <div style={{ background: '#f2ede2', padding: 16, borderRadius: 4, display: 'inline-block' }}>
      <Badge>NO.003</Badge>
    </div>
  );
}

export function Accent() {
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4, display: 'inline-block' }}>
      <Badge tone="accent">NEW</Badge>
    </div>
  );
}

import React, { useState } from 'react';
import { TabGroup } from '@typing-vocab/design-system';

export function Glyph() {
  const [value, setValue] = useState('ko');
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4 }}>
      <TabGroup
        variant="glyph"
        value={value}
        onChange={setValue}
        items={[
          { value: 'ko', label: '한국어' },
          { value: 'en', label: 'english' },
        ]}
      />
    </div>
  );
}

export function Segmented() {
  const [value, setValue] = useState('ko');
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4 }}>
      <TabGroup
        variant="segmented"
        value={value}
        onChange={setValue}
        items={[
          { value: 'ko', label: 'KO' },
          { value: 'en', label: 'EN' },
        ]}
      />
    </div>
  );
}

export function Chips() {
  const [value, setValue] = useState('week');
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4 }}>
      <TabGroup
        variant="chips"
        value={value}
        onChange={setValue}
        items={[
          { value: 'today', label: '오늘' },
          { value: 'week', label: '이번 주' },
          { value: 'month', label: '이번 달' },
          { value: 'all', label: '전체' },
        ]}
      />
    </div>
  );
}

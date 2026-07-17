import React, { useState } from 'react';
import { TextInput } from '@typing-vocab/design-system';

export function DarkSurface() {
  const [value, setValue] = useState('');
  return (
    <div style={{ background: '#0a0a0a', padding: 16, borderRadius: 4, maxWidth: 280 }}>
      <TextInput
        surface="dark"
        placeholder="단어 (한국어/english)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function PaperCentered() {
  return (
    <div style={{ background: '#f2ede2', padding: 16, borderRadius: 4, maxWidth: 320 }}>
      <TextInput surface="paper" centered placeholder="여기를 눌러 입력을 시작하세요" />
    </div>
  );
}

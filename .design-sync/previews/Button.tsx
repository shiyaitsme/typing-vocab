import React from 'react';
import { Button } from '@typing-vocab/design-system';

export function Variants() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
        background: '#0a0a0a',
        padding: 16,
        borderRadius: 4,
      }}
    >
      <Button variant="accent">가져오기</Button>
      <Button variant="invert">shiya</Button>
      <Button variant="outline">취소</Button>
      <Button variant="dashed">----▶</Button>
      <Button variant="ghost">단어 목록</Button>
      <Button variant="danger">초기화</Button>
      <Button variant="danger-solid">삭제하기</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: '#0a0a0a',
        padding: 16,
        borderRadius: 4,
      }}
    >
      <Button variant="accent" size="md">
        저장
      </Button>
      <Button variant="accent" size="sm">
        저장
      </Button>
    </div>
  );
}

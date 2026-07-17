import React, { useState } from 'react';
import { AppHeader, TabGroup, IconButton, Button } from '@typing-vocab/design-system';

export function Full() {
  const [mode, setMode] = useState('ko');
  const [lang, setLang] = useState('ko');
  return (
    <AppHeader
      tagline="+ 한글 & 영어 타자 연습기"
      centerSlot={
        <TabGroup
          variant="glyph"
          value={mode}
          onChange={setMode}
          items={[
            { value: 'ko', label: '한국어' },
            { value: 'en', label: 'english' },
          ]}
        />
      }
      navSlot={
        <>
          <Button variant="ghost">연습</Button>
          <Button variant="ghost">단어 목록</Button>
          <Button variant="ghost">단어장</Button>
          <Button variant="ghost">통계</Button>
        </>
      }
      actionsSlot={
        <>
          <IconButton label="라이트 모드로 전환" variant="soft-circle">
            ☾
          </IconButton>
          <TabGroup
            variant="segmented"
            value={lang}
            onChange={setLang}
            items={[
              { value: 'ko', label: 'KO' },
              { value: 'en', label: 'EN' },
            ]}
          />
          <Button variant="invert">shiya</Button>
        </>
      }
    />
  );
}

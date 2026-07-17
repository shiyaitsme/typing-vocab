import React from 'react';
import { Modal, Button, TextInput } from '@typing-vocab/design-system';

// The modal overlay is `position:fixed;inset:0`, which needs a sized,
// non-static ancestor to fill in an isolated preview cell (the card harness
// gives that ancestor a transform but no explicit height) — this wrapper
// supplies it so the overlay doesn't collapse to zero height.
const stage: React.CSSProperties = { height: '100vh' };

export function BulkImport() {
  return (
    <div style={stage}>
      <Modal
        open
        tone="default"
        title="일괄 가져오기/내보내기"
        description={
          <>
            한 줄에 단어 하나씩, <b>단어,뜻</b> 형식으로 입력하세요.
          </>
        }
        actions={
          <>
            <Button variant="outline">취소</Button>
            <Button variant="accent">가져오기</Button>
          </>
        }
      >
        <textarea
          readOnly
          value={'연천,Yeoncheon\n전곡,Jeongok\n서울,Seoul'}
          style={{
            width: '100%',
            height: 120,
            padding: 11,
            border: '1px solid rgba(242,237,226,.2)',
            background: '#141414',
            color: 'rgb(242,237,226)',
            fontFamily: 'inherit',
            fontSize: 12,
            borderRadius: 2,
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
      </Modal>
    </div>
  );
}

export function NotesOnPaper() {
  return (
    <div style={stage}>
      <Modal
        open
        tone="paper"
        title="✎ 노트 — 전곡"
        description="예문, 관련 지식 등을 자유롭게 적어두세요."
        actions={
          <>
            <Button variant="outline">취소</Button>
            <Button variant="accent">저장</Button>
          </>
        }
      >
        <TextInput surface="dark" defaultValue="경기도 연천군의 읍" />
      </Modal>
    </div>
  );
}

export function DeleteConfirm() {
  return (
    <div style={stage}>
      <Modal
        open
        tone="danger"
        title="단어장을 삭제할까요?"
        description="이 작업은 되돌릴 수 없습니다. 단어장 안의 42개 단어가 모두 삭제됩니다."
        actions={
          <>
            <Button variant="outline">취소</Button>
            <Button variant="danger-solid">삭제하기</Button>
          </>
        }
      />
    </div>
  );
}

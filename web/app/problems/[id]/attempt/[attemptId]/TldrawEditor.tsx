'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils, TLStoreWithStatus } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
const DEBOUNCE_MS = 2000;

interface TldrawEditorProps {
  attemptId: string;
  stageType: 'REQUIREMENTS' | 'DESIGN' | 'EXTENSION';
  initialContent: string; // JSON string of TLStore snapshot, or ''
  disabled?: boolean;
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}

export function TldrawEditor({
  attemptId,
  stageType,
  initialContent,
  disabled = false,
  onSaveStatusChange,
}: TldrawEditorProps) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storeRef = useRef<TLStoreWithStatus | null>(null);

  const saveContent = useCallback(
    async (snapshotJson: string) => {
      onSaveStatusChange?.('saving');
      try {
        await fetch(`${SERVER}/api/attempts/${attemptId}/stages`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stageType, content: snapshotJson }),
        });
        onSaveStatusChange?.('saved');
        setTimeout(() => onSaveStatusChange?.('idle'), 2500);
      } catch {
        onSaveStatusChange?.('error');
        setTimeout(() => onSaveStatusChange?.('idle'), 2500);
      }
    },
    [attemptId, stageType, onSaveStatusChange]
  );

  const handleChange = useCallback(
    (store: any) => {
      if (disabled) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          const snapshot = store.getSnapshot();
          const json = JSON.stringify(snapshot);
          saveContent(json);
        } catch {
          // snapshot failed — ignore
        }
      }, DEBOUNCE_MS);
    },
    [disabled, saveContent]
  );

  // Parse initial snapshot
  let initialSnapshot: any = undefined;
  if (initialContent) {
    try {
      initialSnapshot = JSON.parse(initialContent);
    } catch {
      initialSnapshot = undefined;
    }
  }

  return (
    <div className="w-full h-full relative">
      <Tldraw
        snapshot={initialSnapshot}
        onMount={(editor) => {
          storeRef.current = editor.store as any;
          if (initialSnapshot) {
            try {
              editor.loadSnapshot(initialSnapshot);
            } catch (err) {
              console.error('Failed to load snapshot', err);
            }
          }
          if (!disabled) {
            editor.store.listen(() => handleChange(editor.store), {
              scope: 'document',
            });
          }
          if (disabled) {
            editor.setCurrentTool('hand');
            editor.updateInstanceState({ isReadonly: true });
          }
        }}
        hideUi={disabled}
      />
      {disabled && (
        <div className="absolute inset-0 bg-transparent cursor-not-allowed pointer-events-none" />
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Tldraw, getSnapshot, loadSnapshot, TLStoreWithStatus } from '@tldraw/tldraw';
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
      console.log('[TldrawEditor] Attempting to save snapshot of length:', snapshotJson.length);
      try {
        const res = await fetch(`${SERVER}/api/attempts/${attemptId}/stages`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stageType, content: snapshotJson }),
        });
        if (!res.ok) {
          console.error('[TldrawEditor] Save failed with status:', res.status);
          throw new Error('Failed to save');
        }
        console.log('[TldrawEditor] Save successful!');
        onSaveStatusChange?.('saved');
        setTimeout(() => onSaveStatusChange?.('idle'), 2500);
      } catch (err) {
        console.error('[TldrawEditor] Save error:', err);
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
          console.log('[TldrawEditor] Extracting snapshot...');
          const snapshot = getSnapshot(store);
          const json = JSON.stringify(snapshot);
          saveContent(json);
        } catch (err) {
          console.error('[TldrawEditor] Error extracting snapshot:', err);
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
        onMount={(editor) => {
          storeRef.current = editor.store as any;
          if (initialSnapshot) {
            try {
              loadSnapshot(editor.store, initialSnapshot);
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

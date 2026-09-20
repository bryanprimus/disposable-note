import { useEffect, useState, useRef, useCallback } from 'react';
import { createStore, createCheckpoints, type Store, type Checkpoints } from 'tinybase';
import { createSessionPersister } from 'tinybase/persisters/persister-browser';

export const DEFAULT_NOTE_CONTENT = `# Hello, Disposable Note! ✨

Start typing your markdown here. This note is disposable and will not be saved when you close the browser.

## Features

- **Bold** and *italic* text
- Lists and checkboxes
  - [ ] Todo item
  - [x] Completed item
- [Links](https://example.com)
- Code blocks

\`\`\`js
console.log("Hello, world!");
\`\`\`

> **Tip:** Use keyboard shortcuts like Ctrl+B for bold and Ctrl+I for italic.`;

export const SESSION_STORAGE_KEY = 'disposable_note_session';

// Initialize singleton store and checkpoints
export const tinyStore: Store = createStore();
export const checkpoints: Checkpoints = createCheckpoints(tinyStore);

let isPersisterInitialized = false;

/**
 * Initializes the session persister once in browser environments.
 */
export async function initTinyBaseSessionPersister(): Promise<void> {
  if (isPersisterInitialized) return;
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return;

  try {
    const persister = createSessionPersister(tinyStore, SESSION_STORAGE_KEY);
    await persister.startAutoPersisting();
    isPersisterInitialized = true;

    // If session was empty, populate default content
    const existingContent = tinyStore.getCell('note', 'current', 'content');
    if (typeof existingContent !== 'string') {
      tinyStore.setCell('note', 'current', 'content', DEFAULT_NOTE_CONTENT);
      tinyStore.setCell('note', 'current', 'updatedAt', Date.now());
      checkpoints.addCheckpoint('initial');
    }
  } catch (err) {
    console.warn('Could not initialize TinyBase session persister:', err);
    if (typeof tinyStore.getCell('note', 'current', 'content') !== 'string') {
      tinyStore.setCell('note', 'current', 'content', DEFAULT_NOTE_CONTENT);
      tinyStore.setCell('note', 'current', 'updatedAt', Date.now());
    }
  }
}

/**
 * Custom React hook connecting the editor to TinyBase's reactive in-memory store.
 */
export function useTinyBaseNote() {
  const [content, setContentState] = useState<string>(() => {
    const cell = tinyStore.getCell('note', 'current', 'content');
    return typeof cell === 'string' ? cell : DEFAULT_NOTE_CONTENT;
  });

  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateUndoRedoState = useCallback(() => {
    const [backwards, , forwards] = checkpoints.getCheckpointIds();
    setCanUndo(backwards.length > 0);
    setCanRedo(forwards.length > 0);
  }, []);

  useEffect(() => {
    // Start session persister
    initTinyBaseSessionPersister().then(() => {
      const stored = tinyStore.getCell('note', 'current', 'content');
      if (typeof stored === 'string') {
        setContentState(stored);
      }
      updateUndoRedoState();
    });

    // Listen to changes in the 'content' cell
    const listenerId = tinyStore.addCellListener(
      'note',
      'current',
      'content',
      (_store, _tableId, _rowId, _cellId, newCell) => {
        if (typeof newCell === 'string') {
          setContentState(newCell);
        }
      }
    );

    // Listen to checkpoint changes for Undo/Redo availability
    const checkpointListenerId = checkpoints.addCheckpointIdsListener(() => {
      updateUndoRedoState();
    });

    return () => {
      tinyStore.delListener(listenerId);
      checkpoints.delListener(checkpointListenerId);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [updateUndoRedoState]);

  // Update content in TinyBase with debounced checkpoints for Undo/Redo
  const setContent = useCallback(
    (newContent: string) => {
      setContentState(newContent);
      tinyStore.setCell('note', 'current', 'content', newContent);
      tinyStore.setCell('note', 'current', 'updatedAt', Date.now());

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        checkpoints.addCheckpoint();
        updateUndoRedoState();
      }, 600);
    },
    [updateUndoRedoState]
  );

  const undo = useCallback(() => {
    checkpoints.goBackward();
    const cell = tinyStore.getCell('note', 'current', 'content');
    if (typeof cell === 'string') {
      setContentState(cell);
    }
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const redo = useCallback(() => {
    checkpoints.goForward();
    const cell = tinyStore.getCell('note', 'current', 'content');
    if (typeof cell === 'string') {
      setContentState(cell);
    }
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const clearNote = useCallback(() => {
    setContent('');
    checkpoints.addCheckpoint('cleared');
    updateUndoRedoState();
  }, [setContent, updateUndoRedoState]);

  const loadNote = useCallback(
    (newContent: string) => {
      setContent(newContent);
      checkpoints.clear();
      checkpoints.addCheckpoint('loaded');
      updateUndoRedoState();
    },
    [setContent, updateUndoRedoState]
  );

  return {
    content,
    setContent,
    canUndo,
    canRedo,
    undo,
    redo,
    clearNote,
    loadNote,
  };
}

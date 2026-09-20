import Dexie, { type EntityTable } from 'dexie';

export interface SavedNote {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  charCount: number;
  createdAt: number;
  updatedAt: number;
}

export class DisposableDatabase extends Dexie {
  notes!: EntityTable<SavedNote, 'id'>;

  constructor() {
    super('DisposableNoteDB');
    this.version(1).stores({
      notes: 'id, title, updatedAt, createdAt',
    });
  }
}

export const db = new DisposableDatabase();

/**
 * Extracts a readable note title from markdown content (first header or first sentence).
 */
export function extractNoteTitle(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return 'Untitled Note';

  const lines = trimmed.split('\n');
  for (const line of lines) {
    const clean = line.replace(/^[#*\-=>\s]+/, '').trim();
    if (clean.length > 0) {
      return clean.length > 50 ? clean.slice(0, 50) + '...' : clean;
    }
  }
  return 'Untitled Note';
}

/**
 * Saves a note into the Dexie IndexedDB shelf.
 */
export async function saveToShelf(
  content: string,
  customTitle?: string,
  existingId?: string
): Promise<SavedNote> {
  const title = customTitle?.trim() || extractNoteTitle(content);
  const now = Date.now();
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const note: SavedNote = {
    id: existingId || `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    wordCount,
    charCount,
    createdAt: now,
    updatedAt: now,
  };

  await db.notes.put(note);
  return note;
}

/**
 * Deletes a note by its ID from IndexedDB.
 */
export async function deleteFromShelf(id: string): Promise<void> {
  await db.notes.delete(id);
}

/**
 * Clears all notes from the IndexedDB shelf.
 */
export async function clearShelf(): Promise<void> {
  await db.notes.clear();
}

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SavedNote, deleteFromShelf, clearShelf, detectBrowserStorageLocation } from '../db/dexie';
import {
  IconArchive,
  IconX,
  IconTrash,
  IconFileText,
  IconShare,
  IconPlus,
} from './Icons';
import { compressAndEncode } from '../utils/encoding';

interface LocalShelfDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (content: string) => void;
  onNewNote: () => void;
  onOpenStorageModal: () => void;
}

export const LocalShelfDrawer: React.FC<LocalShelfDrawerProps> = ({
  isOpen,
  onClose,
  onSelectNote,
  onNewNote,
  onOpenStorageModal,
}) => {
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray());
  const browserInfo = detectBrowserStorageLocation();

  if (!isOpen) return null;

  const handleShare = (note: SavedNote) => {
    const encoded = compressAndEncode(note.content);
    const url = `${window.location.origin}/share?content=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400 * 1000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Local Notes Shelf"
      >
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <span className="drawer-icon">
              <IconArchive size={17} />
            </span>
            <div className="drawer-titles">
              <h2 className="drawer-title">Local Shelf</h2>
              <span className="drawer-subtitle">
                {notes ? notes.length : 0} notes · Dexie IndexedDB
              </span>
            </div>
          </div>
          <div className="drawer-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={onClose}
              aria-label="Close shelf"
            >
              <IconX size={15} />
            </button>
          </div>
        </div>

        <div className="drawer-subbar">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              onNewNote();
              onClose();
            }}
          >
            <IconPlus size={13} />
            <span>New Note</span>
          </button>
          <button
            type="button"
            className="drawer-subtle-storage-link"
            onClick={onOpenStorageModal}
            title="Click to see where notes are stored on disk"
          >
            IndexedDB on Mac ↗
          </button>
        </div>

        <div className="drawer-body">
          {!notes || notes.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="drawer-empty-icon">
                <IconFileText size={28} />
              </span>
              <h3>No saved notes on your shelf</h3>
              <p>
                Write something in the editor and click <strong>"Save to Shelf"</strong> to persist it locally on this Mac.
              </p>
            </div>
          ) : (
            <div className="shelf-note-list">
              {notes.map((note) => (
                <div key={note.id} className="shelf-note-card">
                  <div className="shelf-note-main" onClick={() => { onSelectNote(note.content); onClose(); }}>
                    <h4 className="shelf-note-title">{note.title}</h4>
                    <p className="shelf-note-preview">
                      {note.content.slice(0, 100).replace(/[#*\-_`]/g, '') || '(Empty note)'}
                    </p>
                    <div className="shelf-note-meta">
                      <span>{formatDate(note.updatedAt)}</span>
                      <span>·</span>
                      <span>{note.wordCount} words</span>
                    </div>
                  </div>
                  <div className="shelf-note-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleShare(note)}
                      title="Copy compressed share link"
                    >
                      <IconShare size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon text-danger"
                      onClick={() => deleteFromShelf(note.id)}
                      title="Delete from shelf"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <div className="drawer-path-hint">
            <span className="hint-label">Stored on disk at:</span>
            <code className="hint-code">{browserInfo.diskPath}</code>
          </div>
          {notes && notes.length > 0 && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm('Delete all notes from your local IndexedDB shelf?')) {
                  clearShelf();
                }
              }}
            >
              <IconTrash size={13} />
              <span>Clear Shelf</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  IconCpu,
  IconHardDrive,
  IconDatabase,
  IconX,
  IconTrash,
  IconInfo,
} from './Icons';
import { detectBrowserStorageLocation } from '../db/dexie';

interface StorageStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedNotesCount: number;
  onNukeAll: () => void;
}

export const StorageStatusModal: React.FC<StorageStatusModalProps> = ({
  isOpen,
  onClose,
  savedNotesCount,
  onNukeAll,
}) => {
  const [browserInfo, setBrowserInfo] = useState<{
    browser: string;
    diskPath: string;
    idbDatabase: string;
  }>({
    browser: 'Loading...',
    diskPath: '',
    idbDatabase: 'DisposableNoteDB',
  });

  const [sessionSize, setSessionSize] = useState<string>('0 KB');

  useEffect(() => {
    if (isOpen) {
      setBrowserInfo(detectBrowserStorageLocation());
      try {
        const sessionData = window.sessionStorage.getItem('disposable_note_session') || '';
        const bytes = new Blob([sessionData]).size;
        setSessionSize(`${(bytes / 1024).toFixed(1)} KB`);
      } catch {
        setSessionSize('0 KB');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="storage-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">
              <IconDatabase size={18} />
            </span>
            <h2 id="storage-modal-title" className="modal-title">
              Storage Architecture & Privacy
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <IconX size={15} />
          </button>
        </div>

        <div className="modal-body">
          <p className="storage-lead">
            Disposable Note operates with a <strong>dual-tier, 100% client-side</strong> database model.
            No data ever leaves your computer.
          </p>

          <div className="storage-cards">
            {/* Active Scratchpad Tier */}
            <div className="storage-tier-card">
              <div className="tier-header">
                <div className="tier-title-row">
                  <span className="tier-icon ram-icon">
                    <IconCpu size={16} />
                  </span>
                  <div>
                    <h3 className="tier-title">Active Draft (TinyBase)</h3>
                    <span className="tier-engine">In-Memory Store · TinyBase v9</span>
                  </div>
                </div>
                <span className="tier-status-badge ephemeral">Ephemeral</span>
              </div>

              <div className="tier-details">
                <div className="tier-detail-item">
                  <span className="detail-label">Where stored:</span>
                  <span className="detail-value">Browser RAM + <code>sessionStorage</code></span>
                </div>
                <div className="tier-detail-item">
                  <span className="detail-label">Session footprint:</span>
                  <span className="detail-value">{sessionSize}</span>
                </div>
                <div className="tier-detail-item">
                  <span className="detail-label">Lifecycle:</span>
                  <span className="detail-value highlight">
                    Survives refresh/crash · Completely self-destructs on tab close
                  </span>
                </div>
              </div>
            </div>

            {/* Local Shelf Tier */}
            <div className="storage-tier-card">
              <div className="tier-header">
                <div className="tier-title-row">
                  <span className="tier-icon disk-icon">
                    <IconHardDrive size={16} />
                  </span>
                  <div>
                    <h3 className="tier-title">Local Shelf (Dexie.js)</h3>
                    <span className="tier-engine">IndexedDB · Dexie v4</span>
                  </div>
                </div>
                <span className="tier-status-badge persistent">Local Disk</span>
              </div>

              <div className="tier-details">
                <div className="tier-detail-item">
                  <span className="detail-label">Where stored:</span>
                  <span className="detail-value">IndexedDB (<code>DisposableNoteDB</code>)</span>
                </div>
                <div className="tier-detail-item">
                  <span className="detail-label">Saved notes:</span>
                  <span className="detail-value">{savedNotesCount} note{savedNotesCount === 1 ? '' : 's'}</span>
                </div>
                <div className="tier-detail-item">
                  <span className="detail-label">macOS Disk Path:</span>
                  <code className="detail-path-code">{browserInfo.diskPath}</code>
                </div>
                <div className="tier-detail-item">
                  <span className="detail-label">Lifecycle:</span>
                  <span className="detail-value">
                    Persists on this device only · 0 remote servers · 1-click purge
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="devtools-tip">
            <span className="devtools-tip-icon">
              <IconInfo size={15} />
            </span>
            <div className="devtools-tip-content">
              <strong>Inspect live data yourself:</strong>
              <p>
                Press <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>I</kbd> → <strong>Application</strong> tab →{' '}
                <strong>Storage</strong> → <strong>IndexedDB</strong> or <strong>Session Storage</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger"
            onClick={onNukeAll}
            title="Wipe both TinyBase session and Dexie IndexedDB"
          >
            <IconTrash size={14} />
            <span>Nuke All Local Storage</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

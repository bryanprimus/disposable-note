import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useSearchParams,
} from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useLiveQuery } from 'dexie-react-hooks';
import './App.css';
import { ShareButton } from './components/ShareButton';
import { SharedNote } from './pages/SharedNote';
import { LocalShelfDrawer } from './components/LocalShelfDrawer';
import { useTinyBaseNote } from './store/tinybase';
import { db, saveToShelf } from './db/dexie';
import {
  IconFileText,
  IconSun,
  IconMoon,
  IconExpand,
  IconColumns,
  IconTrash,
  IconArchive,
  IconUndo,
  IconRedo,
} from './components/Icons';

function HomePage(): React.ReactElement {
  const {
    content: markdown,
    setContent: setMarkdown,
    canUndo,
    canRedo,
    undo,
    redo,
    clearNote,
    loadNote,
  } = useTinyBaseNote();

  const [html, setHtml] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isShelfOpen, setIsShelfOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const savedNotes = useLiveQuery(() => db.notes.toArray());
  const savedNotesCount = savedNotes ? savedNotes.length : 0;

  const getInitialTheme = (): 'light' | 'dark' => {
    const themeFromUrl = searchParams.get('theme');
    if (themeFromUrl === 'light' || themeFromUrl === 'dark') {
      return themeFromUrl;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light';
    }
    return 'dark';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
  const [hasUserToggledTheme, setHasUserToggledTheme] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const raw = marked.parse(markdown, { breaks: true });
    setHtml(DOMPurify.sanitize(raw as string));
  }, [markdown]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (hasUserToggledTheme || searchParams.has('theme')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('theme', theme);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [theme, hasUserToggledTheme, searchParams, setSearchParams]);

  useEffect(() => {
    if (searchParams.has('theme') || hasUserToggledTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'light' : 'dark');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [searchParams, hasUserToggledTheme]);

  const toggleTheme = () => {
    setHasUserToggledTheme(true);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveToShelf = useCallback(async () => {
    if (!markdown.trim()) return;
    try {
      await saveToShelf(markdown);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Failed to save note to shelf:', err);
      setSaveStatus('Error');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  }, [markdown]);

  // Keyboard shortcut: Cmd+S or Ctrl+S to save to shelf
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveToShelf();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveToShelf]);

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <span className="logo-icon">
              <IconFileText size={16} />
            </span>
            <span className="logo-text">Disposable Note</span>
          </Link>
          <span className="badge">ephemeral</span>
        </div>

        <div className="nav-controls">
          <div className="mobile-view-tabs">
            <button
              type="button"
              className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
              onClick={() => setMobileTab('editor')}
            >
              Write
            </button>
            <button
              type="button"
              className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
              onClick={() => setMobileTab('preview')}
            >
              Preview
            </button>
          </div>

          {/* Undo / Redo Checkpoints */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="btn btn-secondary btn-icon"
            title="Undo (Cmd+Z)"
            type="button"
          >
            <IconUndo size={14} />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className="btn btn-secondary btn-icon"
            title="Redo (Cmd+Shift+Z)"
            type="button"
          >
            <IconRedo size={14} />
          </button>

          <div className="nav-divider" />

          <button
            onClick={handleSaveToShelf}
            className={`btn ${saveStatus ? 'btn-success' : 'btn-secondary'}`}
            title="Save note (Cmd+S)"
            type="button"
          >
            <IconArchive size={14} />
            <span>{saveStatus || 'Save'}</span>
          </button>

          <button
            onClick={() => setIsShelfOpen(true)}
            className="btn btn-secondary"
            title="Open saved notes"
            type="button"
          >
            <IconArchive size={14} />
            <span>Shelf</span>
            {savedNotesCount > 0 && (
              <span className="pill-count">{savedNotesCount}</span>
            )}
          </button>

          <div className="nav-divider" />

          <button
            onClick={clearNote}
            className="btn btn-danger"
            title="Clear active note"
            type="button"
          >
            <IconTrash size={14} />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="btn btn-secondary btn-icon"
            title={isExpanded ? 'Split view' : 'Focus editor'}
            type="button"
          >
            {isExpanded ? <IconColumns size={14} /> : <IconExpand size={14} />}
          </button>

          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-icon"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>

          <div className="nav-divider" />

          <ShareButton content={markdown} theme={theme} />
        </div>
      </nav>

      <main
        className={`main-content ${isExpanded ? 'expanded' : ''} ${
          mobileTab === 'editor' ? 'mobile-show-editor' : 'mobile-show-preview'
        }`}
      >
        <section className="editor-panel">
          <div className="panel-header">
            <span className="panel-header-title">Markdown</span>
            <span className="panel-header-meta">
              {wordCount} words · {charCount} chars
            </span>
          </div>
          <div className="editor-body">
            <textarea
              className="editor-textarea"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your markdown..."
              spellCheck={false}
            />
          </div>
        </section>

        <section className="preview-panel">
          <div className="panel-header">
            <span className="panel-header-title">Preview</span>
            <span className="panel-header-meta">Live render</span>
          </div>
          <div className="preview-body">
            <div
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Disposable Note</span>
        <span className="footer-details">Notes stay on this device</span>
      </footer>

      <LocalShelfDrawer
        isOpen={isShelfOpen}
        onClose={() => setIsShelfOpen(false)}
        onSelectNote={(noteContent) => loadNote(noteContent)}
        onNewNote={() => clearNote()}
      />
    </div>
  );
}

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={<>...</>}>
              <HomePage />
            </React.Suspense>
          }
        />
        <Route path="/share" element={<SharedNote />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
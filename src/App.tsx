import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useSearchParams,
} from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './App.css';
import { ShareButton } from './components/ShareButton';
import { SharedNote } from './pages/SharedNote';
import {
  IconFileText,
  IconSun,
  IconMoon,
  IconExpand,
  IconColumns,
  IconTrash,
} from './components/Icons';

function HomePage(): React.ReactElement {
  const [markdown, setMarkdown] = useState<string>(
    `# Hello, Disposable Note! ✨

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

> **Tip:** Use keyboard shortcuts like Ctrl+B for bold and Ctrl+I for italic.`
  );
  const [html, setHtml] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

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

          <button
            onClick={() => setMarkdown('')}
            className="btn btn-danger"
            title="Clear all text"
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
        <span>Disposable Note — no login, no database, self-destructs on close</span>
        <span className="footer-details">Privacy by design</span>
      </footer>
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
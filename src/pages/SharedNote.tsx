import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { decompressAndDecode } from '../utils/encoding';
import { ShareButton } from '../components/ShareButton';
import {
  IconFileText,
  IconSun,
  IconMoon,
  IconEye,
  IconEdit,
  IconPlus,
} from '../components/Icons';

export const SharedNote: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [markdown, setMarkdown] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

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
  const [isPreviewOnly, setIsPreviewOnly] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('theme', theme);
    setSearchParams(newSearchParams, { replace: true });
  }, [theme, searchParams, setSearchParams]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const content = searchParams.get('content');
    if (content) {
      const decodedContent = decompressAndDecode(content);
      if (decodedContent !== null) {
        setMarkdown(decodedContent);
        setIsError(false);
      } else {
        setMarkdown('# Error\n\nCould not decompress shared content. The link may be corrupted.');
        setIsError(true);
      }
    } else {
      setMarkdown('# Empty Note\n\nNo content was found in this link.');
    }
  }, [searchParams]);

  useEffect(() => {
    const raw = marked.parse(markdown, { breaks: true });
    setHtml(DOMPurify.sanitize(raw as string));
  }, [markdown]);

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
          <span className="badge">shared note</span>
        </div>

        <div className="nav-controls">
          <button
            onClick={() => setIsPreviewOnly((p) => !p)}
            className="btn btn-secondary"
            title={isPreviewOnly ? 'Edit shared note' : 'Show preview only'}
            type="button"
          >
            {isPreviewOnly ? (
              <>
                <IconEdit size={14} />
                <span>Edit</span>
              </>
            ) : (
              <>
                <IconEye size={14} />
                <span>Preview</span>
              </>
            )}
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

          <Link to="/" className="btn btn-primary" title="Create a new note">
            <IconPlus size={14} />
            <span>New Note</span>
          </Link>
        </div>
      </nav>

      <div className="shared-banner">
        <div className="shared-banner-text">
          <span>
            You're viewing a shared note. Edits stay on this device.
          </span>
        </div>
        {!isError && <ShareButton content={markdown} theme={theme} />}
      </div>

      <main className={`main-content ${isPreviewOnly ? 'preview-focused' : ''}`}>
        <section className="editor-panel">
          <div className="panel-header">
            <span className="panel-header-title">Markdown (Editing)</span>
            <span className="panel-header-meta">
              {wordCount} words · {charCount} chars
            </span>
          </div>
          <div className="editor-body">
            <textarea
              className="editor-textarea"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Edit the shared note..."
              spellCheck={false}
            />
          </div>
        </section>

        <section className="preview-panel">
          <div className="panel-header">
            <span className="panel-header-title">Preview</span>
            <span className="panel-header-meta">Rendered</span>
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
        <span className="footer-details">Shared note</span>
      </footer>
    </div>
  );
};
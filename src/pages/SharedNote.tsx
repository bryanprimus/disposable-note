import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { decompressAndDecode } from '../utils/encoding';

export const SharedNote: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [markdown, setMarkdown] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isPreviewOnly, setIsPreviewOnly] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const content = searchParams.get('content');
    if (content) {
      const decodedContent = decompressAndDecode(content);
      if (decodedContent !== null) {
        setMarkdown(decodedContent);
      } else {
        setMarkdown('Error: Could not decompress shared content. The link may be corrupted.');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const raw = marked.parse(markdown, { breaks: true });
    setHtml(DOMPurify.sanitize(raw));
  }, [markdown]);

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">📝 Shared Note</div>
        <div className="nav-controls">
          <button
            onClick={() => setIsPreviewOnly((p) => !p)}
            className="icon-button"
            title={isPreviewOnly ? 'Show editor' : 'Hide editor'}
          >
            {isPreviewOnly ? '✏️' : '📖'}
          </button>
          <button
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            className="icon-button"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main className={`main-content ${isPreviewOnly ? 'preview-focused' : ''}`}>
        <aside className="editor-area">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Edit the shared note..."
          />
        </aside>

        <section className="preview-area">
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      </main>

      <footer className="footer">
        <p>
          This is a shared note. Your changes won't affect the original. <span className="heart">💛</span>
        </p>
      </footer>
    </div>
  );
}; 
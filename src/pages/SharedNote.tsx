import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { decompressAndDecode } from '../utils/encoding';

export const SharedNote: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [markdown, setMarkdown] = useState<string>('');
  const [html, setHtml] = useState<string>('');

  const getInitialTheme = (): 'light' | 'dark' | 'clean' => {
    const themeFromUrl = searchParams.get('theme');
    if (
      themeFromUrl === 'light' ||
      themeFromUrl === 'dark' ||
      themeFromUrl === 'clean'
    ) {
      return themeFromUrl;
    }
    return 'dark';
  };

  const [theme, setTheme] = useState<'light' | 'dark' | 'clean'>(
    getInitialTheme()
  );
  const [isPreviewOnly, setIsPreviewOnly] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('theme', theme);
    setSearchParams(newSearchParams, { replace: true });
  }, [theme, searchParams, setSearchParams]);

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'clean'> = ['dark', 'light', 'clean'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getNextTheme = () => {
    const themes: Array<'light' | 'dark' | 'clean'> = ['dark', 'light', 'clean'];
    const currentIndex = themes.indexOf(theme);
    return themes[(currentIndex + 1) % themes.length];
  };

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '📄';
  };

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
            onClick={toggleTheme}
            className="icon-button"
            title={`Switch to ${getNextTheme()} mode`}
          >
            {getThemeIcon()}
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
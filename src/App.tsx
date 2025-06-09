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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const raw = marked.parse(markdown, { breaks: true });
    setHtml(DOMPurify.sanitize(raw));
  }, [markdown]);

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
  }

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '📄';
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            📝 Disposable Note
          </Link>
        </div>
        <div className="nav-controls">
          <ShareButton content={markdown} theme={theme} />
          <button
            onClick={() => setIsExpanded((d) => !d)}
            className="icon-button"
            title={isExpanded ? 'Collapse editor' : 'Expand editor'}
          >
            {isExpanded ? '↩️' : '↔️'}
          </button>
          <button
            onClick={toggleTheme}
            className="icon-button"
            title={`Switch to ${getNextTheme()} mode`}
          >
            {getThemeIcon()}
          </button>
          <button onClick={() => setMarkdown('')} className="clear-btn">
            Clear All
          </button>
        </div>
      </nav>

      <main className={`main-content ${isExpanded ? 'expanded' : ''}`}>
        <aside className="editor-area">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write your markdown..."
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
          Disposable note—won't be saved. <span className="heart">💛</span>
        </p>
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
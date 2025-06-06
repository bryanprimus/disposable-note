import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const raw = marked.parse(markdown, { breaks: true });
    setHtml(DOMPurify.sanitize(raw));
  }, [markdown]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            📝 Disposable Note
          </Link>
        </div>
        <div className="nav-controls">
          <ShareButton content={markdown} />
          <button
            onClick={() => setIsExpanded((d) => !d)}
            className="icon-button"
            title={isExpanded ? 'Collapse editor' : 'Expand editor'}
          >
            {isExpanded ? '↩️' : '↔️'}
          </button>
          <button
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            className="icon-button"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '☀️' : '🌙'}
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
        <Route path="/" element={<HomePage />} />
        <Route path="/share" element={<SharedNote />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
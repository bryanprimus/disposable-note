import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './App.css';

function App(): React.ReactElement {
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
        <div className="logo">📝 Disposable Note</div>
        <div className="nav-controls">
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

      <main className="main-content">
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

export default App;
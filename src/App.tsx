import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './App.css';

function App(): React.ReactElement {
  const [markdown, setMarkdown] = useState<string>('# Hello, Disposable Note! ✨\n\nStart typing your markdown here. This note is disposable and will not be saved when you close the browser.\n\n## Features\n\n- **Bold** and *italic* text\n- Lists and checkboxes\n  - [ ] Todo item\n  - [x] Completed item\n- [Links](https://example.com)\n- Code blocks\n\n```js\nconsole.log("Hello, world!");\n```\n\n> **Tip:** You can use keyboard shortcuts like Ctrl+B for bold and Ctrl+I for italic in many browsers!');
  const [html, setHtml] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Convert markdown to HTML and sanitize
    const rawHtml = marked(markdown);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    setHtml(sanitizedHtml);
  }, [markdown]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMarkdown(e.target.value);
  };

  const handleClear = (): void => {
    setMarkdown('');
  };

  const toggleTheme = (): void => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app">
      <header>
        <h1>✏️ Disposable Note</h1>
        <div className="header-buttons">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-button" 
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleClear} className="clear-button">
            Clear
          </button>
        </div>
      </header>
      
      <main className="editor-container">
        <div className="editor-pane">
          <textarea 
            value={markdown} 
            onChange={handleChange} 
            placeholder="Write your markdown here..."
            className="markdown-editor"
          />
        </div>
        
        <div className="preview-pane">
          <div 
            className="markdown-preview" 
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>
      
      <footer>
        <p>This note is disposable and will not be saved when you close the browser. <span style={{ opacity: 0.7 }}>Made with ❤️</span></p>
      </footer>
    </div>
  );
}

export default App;
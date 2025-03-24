import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './App.css';

function App(): React.ReactElement {
  const [markdown, setMarkdown] = useState<string>('# Hello, Disposable Note!\n\nStart typing your markdown here. This note is disposable and will not be saved when you close the browser.\n\n## Features\n\n- **Bold** and *italic* text\n- Lists and checkboxes\n  - [ ] Todo item\n  - [x] Completed item\n- [Links](https://example.com)\n- Code blocks\n\n```js\nconsole.log("Hello, world!");\n```');
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    // Convert markdown to HTML and sanitize
    const rawHtml = marked(markdown);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    setHtml(sanitizedHtml);
  }, [markdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMarkdown(e.target.value);
  };

  const handleClear = (): void => {
    setMarkdown('');
  };

  return (
    <div className="app">
      <header>
        <h1>Disposable Note</h1>
        <button onClick={handleClear} className="clear-button">
          Clear
        </button>
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
        <p>This note is disposable and will not be saved when you close the browser.</p>
      </footer>
    </div>
  );
}

export default App;
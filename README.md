# Disposable Note

A simple web application for writing quick, disposable notes with Markdown support. The app features a side-by-side editor and preview layout, allowing you to write in Markdown and see the formatted result in real-time.

## Features

- **Side-by-side Markdown editor and preview** with real-time live render
- **Ephemeral Active Scratchpad (TinyBase):** Reactive in-memory store with `sessionStorage` crash protection (survives reload, self-destructs when tab closes)
- **Local Shelf (Dexie.js):** Save notes to your local machine via IndexedDB with zero cloud servers
- **Full Undo / Redo:** Built-in multi-step history checkpoints (`Cmd+Z` / `Cmd+Shift+Z`)
- **Transparent Storage Indicator:** Subtle UI badge showing exact physical disk path (`~/Library/.../IndexedDB`) and 1-click "Nuke All" privacy purge
- **Instant URL Compression Sharing:** Stateless snapshot links powered by `lz-string`
- **Dark & Light Mode:** Automatic system preference detection with manual toggle

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

### Development

Run the development server:

```
npm run dev
```

or

```
yarn dev
```

This will start the development server at http://localhost:3000.

### Building for Production

Build the app for production:

```
npm run build
```

or

```
yarn build
```

## Technologies Used

- React.js 18
- Vite (build tool)
- [TinyBase](https://tinybase.org) (Reactive in-memory store & session persister)
- [Dexie.js](https://dexie.org) (IndexedDB wrapper for local-first storage)
- marked (Markdown parser)
- DOMPurify (HTML sanitizer)
- lz-string (URL snapshot compression)

## License

MIT
# Disposable Note

A simple web application for writing quick, disposable notes with Markdown support. The app features a side-by-side editor and preview layout, allowing you to write in Markdown and see the formatted result in real-time.

## Features

- Side-by-side Markdown editor and preview
- Real-time preview as you type
- Support for all standard Markdown syntax
- Clean, responsive design
- No data persistence - notes are truly disposable

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

- React.js
- Vite (build tool)
- marked (Markdown parser)
- DOMPurify (HTML sanitizer)

## License

MIT
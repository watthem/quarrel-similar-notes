# CLAUDE.md

This file provides guidance to Claude Code when working with the quarrel-similar-notes plugin.

## Project Overview

An Obsidian plugin that surfaces semantically similar notes using TF-IDF similarity. Built on [@watthem/quarrel](https://github.com/watthem/quarrel).

## Directory Structure

```
quarrel-similar-notes/
├── src/
│   ├── main.ts           # Plugin entry point
│   ├── SimilarNotesView.ts   # Sidebar panel view
│   ├── settings.ts       # Plugin settings
│   └── index.ts          # SimilarNotesIndex class
├── docs/
│   └── prd/              # Product requirements documents
├── manifest.json         # Obsidian plugin manifest
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── styles.css            # Plugin styles
├── main.js               # Built output (gitignored)
├── README.md
├── LICENSE
├── TODO.md               # Public roadmap
├── FEEDBACK.md           # Obsidian guidelines checklist
└── CLAUDE.md
```

## Commands

```bash
# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build
```

## Architecture

### Core Components

1. **SimilarNotesIndex** (`src/index.ts`)
   - Manages the TF-IDF index for all vault notes
   - Uses @watthem/quarrel for vectorization and similarity
   - Caches vectors for fast queries

2. **SimilarNotesView** (`src/SimilarNotesView.ts`)
   - Obsidian ItemView for the sidebar panel
   - Updates when active file changes
   - Displays ranked similar notes

3. **Settings** (`src/settings.ts`)
   - Plugin settings tab
   - Configures max results, min similarity, hash dimensions, etc.

### Data Flow

```
Vault Files → buildIndex() → TF-IDF Vectors → findSimilar() → Ranked Results → View
```

### Dependencies

- `@watthem/quarrel` - TF-IDF similarity engine
- `obsidian` - Obsidian plugin API (dev dependency)

## Key Design Decisions

1. **Feature hashing by default** - Uses hashed TF-IDF for constant memory usage
2. **Explicit indexing** - Users trigger index builds, no background magic
3. **No external calls** - Everything runs locally, no API keys needed
4. **MIT licensed** - No restrictions on forks or modifications

## Testing

Currently tested via the quarrel package's test suite. Plugin-specific tests to be added.

To test manually:
1. Build with `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to your test vault's `.obsidian/plugins/quarrel-similar-notes/`
3. Reload Obsidian and enable the plugin

See `TODO.md` for the full manual testing checklist.

## Git Identity

This repo uses the @watthem identity:
- Email: matthew.scott.hendricks@gmail.com
- SSH Host: github.com-watthem

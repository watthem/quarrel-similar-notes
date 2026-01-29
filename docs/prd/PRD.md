# Product Requirements Index

This folder tracks product requirements for Quarrel-powered apps and plugins.

## Vision

Quarrel enables local-first, privacy-respecting similarity features without external APIs or ML models. The flagship application is an Obsidian plugin that surfaces related notes using TF-IDF—a transparent alternative to plugins with opaque embeddings or restrictive licenses.

## Documents

### Core (MVP)
- [Similar Notes MVP](./similar-notes-mvp.md) — Right sidebar panel showing related notes

### Planned Features
- [Incremental Indexing](./incremental-indexing.md) — Per-file updates without full rebuilds
- [Semantic Search](./semantic-search.md) — Search by meaning, not just keywords
- [Ranking Explanations](./ranking-explanations.md) — Show why notes are similar

## Roadmap

```
Phase 1: MVP
├── Local similarity index
├── Right sidebar panel
├── Explicit rebuild commands
└── Basic settings

Phase 2: Performance
├── Incremental indexing
├── Fingerprint-based change detection
└── Auto-index on save (optional)

Phase 3: Discovery
├── Semantic search modal
├── Ranking explanations
└── "More like this" actions

Phase 4: Advanced (TBD)
├── Tag/section-level similarity
├── Related notes auto-insert
└── Optional local embeddings
```

## Design Principles

1. **Local-first**: All processing happens on-device. No network calls.
2. **Transparent**: Users can understand why results appear (no black-box ML).
3. **Explicit control**: Indexing is user-initiated, not magic background sync.
4. **Lightweight**: Fast enough for large vaults without heavy dependencies.
5. **Open**: MIT licensed, no paywall restrictions on forks.

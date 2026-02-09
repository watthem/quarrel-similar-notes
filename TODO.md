# TODO - Quarrel Similar Notes Plugin Roadmap

Public roadmap for the Quarrel Similar Notes Obsidian plugin.

## Pre-Release Checklist

Issues that must be fixed before the first public release.

### Release Pipeline

- [ ] **0.1.0 milestone** - Align on scope and freeze for 0.1.0
  - Confirm no blockers in `FEEDBACK.md`
  - Decide whether to ship with or without incremental indexing
- [x] **Release script** - Build and package `main.js`, `manifest.json`, `styles.css`
  - Script: `scripts/release.mjs`
  - Command: `npm run release`

### Code Quality

- [x] **Fix Notice import** - Replace `declare function Notice` with proper import from obsidian
  - File: `src/main.ts:149`
  - Current: `declare function Notice(message: string): void;`
  - Should be: `import { Notice } from "obsidian";`

- [x] **Fix settings UI** - Use Obsidian's `setHeading()` API instead of raw HTML elements
  - File: `src/settings.ts:32,104`
  - Remove "Settings" from heading title per Obsidian guidelines
  - Use `new Setting(containerEl).setHeading()` pattern

### Build Configuration

- [x] **Enable minification** - Production builds should be minified
  - File: `esbuild.config.mjs`
  - Add `minify: true` when `prod === true`

- [x] **Commit lock file** - Remove `package-lock.json` from `.gitignore`
  - Obsidian guidelines require a committed lock file for security review

### Manifest

- [x] **Choose unique plugin ID** - Current `id: "similar-notes"` may conflict
  - Options: `obsidian-similar-notes`, `quarrel-similar-notes`, `tfidf-similar-notes`
  - Must be unique across all Obsidian plugins

- [x] **Add versions.json** - Required for Obsidian plugin updates
  - Create `versions.json` mapping plugin versions to minimum Obsidian versions

### Documentation

- [x] **Add disclosure section to README** - Explicitly state:
  - No network calls (already implied, make explicit)
  - No telemetry or analytics
  - No external accounts required
  - Dependencies: `@watthem/quarrel` (MIT, no network)

### Beta / Feedback

- [ ] **Recruit early testers** - Post invite and collect issues
  - Create a short survey or feedback template
  - Track feedback in `FEEDBACK.md`
  - Triage issues into this TODO
- [ ] **Obsidian forum draft** - Draft the release announcement post
  - Include: summary, features, privacy/local-first notes, install instructions
  - Add screenshots/GIFs if available

---

## MVP Features (Phase 1)

Core functionality for initial release.

- [x] Right sidebar panel showing similar notes
- [x] Similarity index using TF-IDF via quarrel
- [x] Explicit rebuild command
- [x] Basic settings (max results, min similarity, hash dimensions, content length)
- [x] Click to open similar note
- [ ] **Empty state polish** - Better messaging when:
  - No active note selected
  - Index not yet built
  - No similar notes found
- [ ] **Loading indicator** - Show progress during index build for large vaults
- [ ] **Error handling** - Graceful handling of corrupt/binary files

---

## Performance (Phase 2)

Optimizations for large vaults.

- [ ] **Incremental indexing** - Update only changed files instead of full rebuild
  - Use `fingerprintText()` to detect changes
  - Track added/modified/deleted files
  - See: `docs/prd/incremental-indexing.md`

- [ ] **Auto-index on save** - Optional setting to update index when files change
  - Debounce rapid saves (2-second delay)
  - Non-blocking background update

- [ ] **Index persistence** - Save index to disk between sessions
  - Avoid full rebuild on Obsidian restart
  - Store in plugin data folder

- [ ] **Benchmark suite** - Performance tests for various vault sizes
  - Target: 500 notes < 2s, 2000 notes < 8s, 10000 notes < 40s

---

## Discovery (Phase 3)

Enhanced ways to find related content.

- [ ] **Semantic search modal** - Search by meaning, not just keywords
  - Command palette integration
  - Debounced results as you type
  - See: `docs/prd/semantic-search.md`

- [ ] **Ranking explanations** - Show why notes are similar
  - "Why similar?" action on each result
  - Display top contributing terms
  - See: `docs/prd/ranking-explanations.md`

- [ ] **"More like this" action** - Quick way to find notes similar to a search result

---

## Advanced (Phase 4+)

Future ideas, not yet planned.

- [ ] Tag/section-level similarity
- [ ] Related notes auto-insert (frontmatter or note body)
- [ ] Graph view integration
- [ ] Optional local embeddings for higher recall (significant scope increase)

---

## Testing

Current test coverage and gaps.

### Quarrel Library (upstream)
- [x] `cosineSimilarity` - 14 tests
- [x] `fingerprintText` - 6 tests
- [x] `tokenize`, `normalizeMarkdown`, `stripFrontmatter` - 14 tests
- [x] `buildTfidfVectors`, `buildHashedTfidfVectors`, `vectorizeDocuments` - 13 tests
- [x] Determinism tests - 8 tests
- [x] TF-IDF behavior tests - 5 tests
- [x] Example integration tests - 27 tests

> **Note:** Quarrel's `examples/obsidian-similar-notes.js` is a simplified reference implementation
> with synchronous mocks. This plugin (`src/index.ts`) uses proper async Obsidian APIs.

### Plugin (this repo)
- [ ] **Add plugin tests** - Partial coverage added
  - [x] Unit tests for `SimilarNotesIndex` class
  - [x] Mock Obsidian API with async behavior
  - [ ] Settings persistence tests
  - [ ] View rendering tests

### Manual Testing Checklist
- [ ] Fresh install in empty vault
- [ ] Install in vault with 100+ notes
- [ ] Install in vault with 1000+ notes
- [ ] Settings changes persist across restart
- [ ] Ribbon icon opens panel
- [ ] Command palette commands work
- [ ] Panel updates on file navigation
- [ ] Results are clickable and open correct note
- [ ] Mobile compatibility (if `isDesktopOnly: false`)

---

## Community Plugin Submission

Checklist for submitting to Obsidian's community plugin directory.

- [ ] All pre-release checklist items complete
- [ ] At least one GitHub release with `main.js`, `manifest.json`, `styles.css`
- [ ] README follows disclosure guidelines
- [ ] No console.log statements in production build
- [ ] Tested on desktop (Windows, macOS, Linux)
- [ ] Tested on mobile (iOS, Android) if `isDesktopOnly: false`
- [ ] Submit PR to [obsidian-releases](https://github.com/obsidianmd/obsidian-releases)

---

## Notes

### Design Principles
1. **Local-first** - All processing on-device, no network calls
2. **Transparent** - Users can understand why results appear (TF-IDF, not black-box ML)
3. **Explicit control** - Indexing is user-initiated, not magic background sync
4. **Lightweight** - Fast enough for large vaults without heavy dependencies
5. **Open** - MIT licensed, no paywall restrictions

### Dependencies
- `@watthem/quarrel` - TF-IDF similarity engine (MIT, no external calls)
- `obsidian` - Plugin API (dev dependency only)

### Related Documents
- PRDs: `docs/prd/`
- Obsidian Plugin Guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

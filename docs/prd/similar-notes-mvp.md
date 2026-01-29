# Similar Notes (Obsidian MVP)

## Summary
A local-only Obsidian plugin that surfaces semantically similar notes in a right-sidebar panel. Powered by TF-IDF + cosine similarity via Quarrel. No external calls, no embeddings, no API keys.

## Goals
- Provide fast, private, local similarity results for notes in a vault.
- Ship a minimal, reliable UI in the right sidebar.
- Keep indexing explicit and user-controlled.

## Non-goals
- Remote embeddings or external APIs.
- Full parity with Smart Connections.
- Cross-vault or multi-device sync of the index.

## Primary User Story
As a note-taker, I want to see related notes while I work so I can connect ideas without leaving the local-first workflow.

## Features
### 1) Local Similarity Index
- Build a hashed TF-IDF index over markdown notes.
- Configurable vector size and content excerpt length.
- Store fingerprints to detect changes.

Acceptance criteria
- Index build runs locally and finishes without network access.
- Index contains one vector per markdown file.
- Fingerprints update after a rebuild.

### 2) Right Sidebar Panel
- Panel shows related notes for the active file.
- Results are sorted by similarity with a simple score display.
- Clicking a result opens the target note.

Acceptance criteria
- Panel appears in right sidebar when activated.
- Panel updates on file-open events.
- Empty states are shown when no note is open or no matches are found.

### 3) Explicit Rebuild and Change Check
- Command and panel action to rebuild the index.
- Command and panel action to check for changes and mark index as stale.

Acceptance criteria
- "Rebuild" action completes and updates the last-built timestamp.
- "Check for changes" sets a visible "out of date" warning if changes exist.

### 4) Settings
- Max results
- Min similarity threshold
- Hash dimension
- Content excerpt length
- Open panel on start

Acceptance criteria
- Settings persist across restarts.
- Changing hash dimension or excerpt length prompts a rebuild.

## UX Notes
- Default to a lightweight, readable list view.
- Prioritize clarity over novelty; scores are approximate.
- Show a compact status line with last indexed time.

## Performance Notes
- Hashing default: 2048 dimensions.
- Content excerpt default: 1500 characters.
- Expect near-instant UI queries once indexed.

## Privacy Notes
- All data processing is local.
- No files or metadata leave the vault.

## Future Ideas (Not in MVP)
- Incremental per-file index updates without full rebuild.
- Similarity search modal with fuzzy filtering.
- Tag and section-level similarity.
- Related notes auto-insert into frontmatter or note body.
- Optional local embeddings for higher recall.

## Milestones
1) MVP plugin with sidebar + indexing + settings.
2) Early user feedback and benchmarks across vault sizes.
3) Decide on advanced features based on scale findings.

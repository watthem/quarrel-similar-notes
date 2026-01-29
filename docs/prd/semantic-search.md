# Semantic Search Modal

## Summary
A search modal that finds notes by meaning rather than exact keywords. Users type a query, and the plugin returns notes ranked by TF-IDF similarity to the query text.

## Goals
- Provide a fast, local alternative to keyword search for conceptual queries.
- Surface relevant notes even when exact terms don't match.
- Integrate naturally with Obsidian's command palette workflow.

## Non-goals
- Replace Obsidian's built-in search (complements, not replaces).
- Natural language understanding or question answering.
- Cross-vault or web search.

## Primary User Story
As a researcher, I want to search my vault by concept (e.g., "distributed systems consensus") and find relevant notes even if they use different terminology.

## Features

### 1) Search Modal
- Command: "Semantic Search" opens a modal with a text input.
- Results appear as user types (debounced, ~300ms).
- Results show note title, similarity score, and brief excerpt.

Acceptance criteria:
- Modal opens via command palette or hotkey.
- Results update within 500ms of typing pause.
- Clicking a result opens the note and closes the modal.

### 2) Query Vectorization
- Convert query text to a vector using the same TF-IDF pipeline.
- Compare query vector against all indexed note vectors.
- Rank by cosine similarity.

Acceptance criteria:
- Query uses same tokenization and stopwords as indexing.
- Empty or stopword-only queries show helpful message.
- Results are sorted highest similarity first.

### 3) Result Filtering
- Minimum similarity threshold (configurable, default 0.1).
- Maximum results (configurable, default 20).
- Optional: filter by folder or tag prefix.

Acceptance criteria:
- Low-similarity noise is filtered out.
- Folder/tag filter is optional and clearly labeled.
- Filter settings persist in plugin settings.

### 4) Keyboard Navigation
- Arrow keys navigate results.
- Enter opens selected result.
- Escape closes modal.
- Tab cycles between input and results.

Acceptance criteria:
- Full keyboard navigation without mouse.
- Focus management follows accessibility best practices.
- No focus traps.

## UX Notes

### Query Examples
Show placeholder text with example queries:
- "machine learning optimization"
- "weekly review template"
- "project planning checklist"

### Score Display
- Show percentage (e.g., "87%") rather than raw decimal.
- Use subtle color gradient or bar to visualize similarity.
- Tooltip explains: "Based on shared terminology, not exact matches."

### Empty States
- No index: "Build the index first using Similar Notes settings."
- No matches: "No similar notes found. Try different keywords."
- Query too short: "Enter at least 2 words to search."

## Technical Notes

### Performance
- Query vectorization: < 10ms for typical queries.
- Similarity computation: O(n) where n = indexed notes.
- Target: < 100ms total for 5,000 note vault.

### Hashing Mode Queries
When using feature hashing:
- Query tokens are hashed to the same dimension space.
- No vocabulary lookup needed.
- Slight accuracy tradeoff for speed.

### Caching
- Cache recent query vectors for repeated/refined searches.
- Clear cache when index is rebuilt.

## Privacy Notes
- Queries are processed locally.
- No query logging or analytics.

## Dependencies
- Requires Similar Notes MVP with indexed vault.
- Benefits from Incremental Indexing for fresh results.

## Future Extensions
- Fuzzy query expansion (stemming, synonyms).
- "More like this" button on search results.
- Search within search results (refinement).
- Save searches as smart folders.

## Milestones
1. Basic modal with query input and ranked results.
2. Keyboard navigation and accessibility.
3. Filtering options (folder, tag, threshold).
4. Performance optimization for large vaults.

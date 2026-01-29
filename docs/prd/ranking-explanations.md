# Ranking Explanations

## Summary
Surface transparency into why two notes are considered similar. Show users the shared terms driving the similarity score, building trust and enabling discovery.

## Goals
- Help users understand similarity scores beyond a number.
- Enable discovery of unexpected connections through shared terms.
- Build trust in local-first, non-ML similarity.

## Non-goals
- Full academic IR explanation (keep it accessible).
- Real-time explanation updates during editing.
- Explanation for every possible note pair (on-demand only).

## Primary User Story
As a curious user, I want to understand why a note appears as "similar" so I can trust the results and discover non-obvious connections.

## Features

### 1) "Why Similar?" Action
- Button or context menu on each result in the sidebar.
- Opens a popover or modal showing explanation.
- Available in both sidebar panel and search modal.

Acceptance criteria:
- Action is discoverable but not intrusive.
- Explanation loads within 200ms.
- Works for any displayed similarity result.

### 2) Shared Terms Display
- List the top N terms (default 5) contributing to similarity.
- Show each term's contribution weight.
- Highlight terms that appear in both notes.

Acceptance criteria:
- Terms are sorted by contribution (highest first).
- Weights are shown as percentages or relative bars.
- Terms link to in-note occurrences when clicked.

### 3) Term-in-Context Preview
- For each shared term, show a brief snippet from each note.
- Highlight the term within the snippet.
- Snippets are ~50 characters of context.

Acceptance criteria:
- Snippets accurately show term usage.
- Highlighting is visually clear.
- Long terms are not truncated awkwardly.

### 4) Score Breakdown
- Show how the final score is computed:
  - Number of shared terms
  - Average term weight
  - Normalized similarity percentage

Acceptance criteria:
- Breakdown is optional (collapsed by default).
- Math is explained in plain language.
- Advanced users can see raw values.

## UX Notes

### Explanation Modal Layout
```
┌─────────────────────────────────────────┐
│ Why "Note A" matches "Note B"           │
│ Similarity: 73%                         │
├─────────────────────────────────────────┤
│ Top Shared Terms:                       │
│                                         │
│ 1. "kubernetes" (32%)                   │
│    Note A: "...deploying to kubernetes  │
│             cluster..."                 │
│    Note B: "...kubernetes networking    │
│             policies..."                │
│                                         │
│ 2. "deployment" (18%)                   │
│    Note A: "...blue-green deployment    │
│             strategy..."                │
│    Note B: "...deployment pipeline      │
│             stages..."                  │
│                                         │
│ 3. "container" (12%)                    │
│    ...                                  │
├─────────────────────────────────────────┤
│ ▶ Show score breakdown                  │
└─────────────────────────────────────────┘
```

### Accessibility
- Screen reader friendly term list.
- Keyboard navigable term highlights.
- Sufficient color contrast for highlights.

### Educational Tooltip
First-time users see a brief explanation:
> "Similarity is based on shared terminology weighted by uniqueness.
> Common words like 'the' are ignored. Rare shared terms score higher."

## Technical Notes

### Contribution Calculation
For standard TF-IDF (with vocabulary):
```
contribution[term] = vecA[term] * vecB[term]
total = sum(contributions)
percentage[term] = contribution[term] / total * 100
```

For hashed TF-IDF:
- Map terms to hash buckets.
- Contribution is per-bucket, attributed to most frequent term in that bucket.
- Note: collisions may attribute score to wrong term (acceptable tradeoff).

### Performance
- Explanation computed on-demand, not precomputed.
- Cache explanations for recently viewed pairs.
- Target: < 50ms for explanation generation.

### Vocabulary Mode Advantage
Standard mode (non-hashed) provides more accurate explanations because:
- Each vector position maps to exactly one term.
- No collision ambiguity.

Consider recommending standard mode for users who value explanations.

## Privacy Notes
- Explanations are computed locally.
- No term data leaves the vault.

## Dependencies
- Requires Similar Notes MVP.
- Enhanced accuracy with standard (non-hashed) indexing mode.

## Future Extensions
- "Find more notes about [term]" quick action.
- Explanation export for note linking.
- Visual graph of term connections.
- A/B comparison mode for two selected notes.

## Milestones
1. Basic "Why Similar?" modal with top terms.
2. Term-in-context snippets with highlighting.
3. Score breakdown (collapsible).
4. First-time user education tooltip.

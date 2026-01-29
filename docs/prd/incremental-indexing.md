# Incremental Indexing

## Summary
Extend the Similar Notes plugin to support per-file index updates without requiring a full vault rebuild. Uses fingerprinting to detect changed files and updates only the affected vectors.

## Goals
- Reduce indexing time for large vaults after small edits.
- Keep the index fresh without manual intervention.
- Maintain accuracy parity with full rebuilds.

## Non-goals
- Real-time indexing on every keystroke.
- Background sync across devices.
- Perfect IDF recalculation (acceptable drift between full rebuilds).

## Primary User Story
As a power user with a large vault, I want the index to stay current without waiting for a full rebuild every time I edit a few notes.

## Features

### 1) Change Detection via Fingerprints
- Store a fingerprint (8-char hash) per indexed file.
- On "check for changes", compare stored fingerprints against current file content.
- Mark files as added, modified, or deleted.

Acceptance criteria:
- Changed files are detected in under 1 second for vaults up to 5,000 notes.
- Deleted files are detected and removed from the index.
- New files are detected and queued for indexing.

### 2) Partial Vector Update
- For modified/added files, recompute TF and apply existing IDF weights.
- Remove vectors for deleted files.
- Queue a background IDF refresh after a threshold of changes (e.g., 10% of corpus).

Acceptance criteria:
- Updating 10 files in a 1,000-note vault completes in under 500ms.
- Similarity results remain accurate within acceptable drift.
- IDF refresh runs automatically when drift threshold is exceeded.

### 3) Auto-Index on File Save (Optional)
- Setting to enable automatic incremental update on file save.
- Debounce rapid saves (e.g., 2-second delay).
- Show subtle status indicator during update.

Acceptance criteria:
- Auto-index can be toggled in settings.
- Debouncing prevents excessive re-indexing during active editing.
- Status indicator is non-intrusive.

### 4) Manual Sync Commands
- "Sync Index" command: detect changes and apply incremental updates.
- "Full Rebuild" command: discard index and rebuild from scratch.
- Clear distinction in UI between sync and rebuild.

Acceptance criteria:
- Sync command only processes changed files.
- Full rebuild ignores fingerprints and reprocesses everything.
- Both commands report completion time and file counts.

## Technical Notes

### IDF Drift
Incremental updates reuse cached IDF values. As the corpus changes, IDF accuracy drifts. Mitigation:
- Track cumulative change count since last full rebuild.
- Trigger IDF refresh (or full rebuild prompt) at 10-20% drift.
- Display "index may be stale" warning when drift is high.

### Storage Format
```
index.json:
{
  "version": 1,
  "builtAt": "2026-01-28T12:00:00Z",
  "hashDim": 2048,
  "changesSinceRebuild": 42,
  "files": {
    "notes/foo.md": {
      "fingerprint": "a1b2c3d4",
      "vector": [0.1, 0.2, ...]
    }
  },
  "idf": [1.2, 0.8, ...] // cached IDF weights (hashing mode)
}
```

## Performance Targets
| Vault Size | Full Rebuild | Incremental (10 files) |
|------------|--------------|------------------------|
| 500 notes  | < 2s         | < 100ms                |
| 2,000 notes| < 8s         | < 200ms                |
| 10,000 notes| < 40s       | < 500ms                |

## Privacy Notes
- All processing remains local.
- Index file stored in plugin data folder within the vault.

## Dependencies
- Requires Similar Notes MVP (sidebar, settings, base indexing).

## Milestones
1. Fingerprint-based change detection.
2. Incremental vector updates with cached IDF.
3. Auto-index on save (optional setting).
4. IDF drift detection and refresh prompts.

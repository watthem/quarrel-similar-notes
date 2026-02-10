# Community Posts — Design Partner Recruitment

## Posting Order

1. Post to Obsidian Forum first (longer-lived discovery + better threaded feedback).
2. Post to Reddit second, 6-12 hours later, using the same release and screenshot set.

## Obsidian Forum Post

**Category**: Share & showcase
**Title**: Looking for design partners: local TF-IDF similar notes plugin

---

I've been building a plugin that shows similar notes in a sidebar panel using TF-IDF similarity. It's local-only — no API keys, no network calls, no embeddings. The similarity engine is a separate open-source library ([quarrel](https://github.com/watthem/quarrel)) that does tokenization, term weighting, and cosine similarity entirely on-device.

**What it does today:**
- Sidebar panel that updates as you navigate between notes
- Keyword chips extracted from the current note — click one to filter results by that term
- Collapsible result cards with similarity score, content snippet, and tags
- Stale index detection when vault content changes
- Optional auto-reindex with configurable debounce

**What I'm looking for:**
- People who'd try it in a real vault (any size) and tell me what's useful and what isn't
- Feedback on the ranking quality — does TF-IDF surface the right notes, or do you find yourself wanting something different?
- UI opinions — is the sidebar layout clear? Are keyword chips useful or noisy?
- Edge cases I haven't hit — large vaults, unusual note structures, mobile usage

The plugin is MIT licensed and on GitHub: [quarrel-similar-notes](https://github.com/watthem/quarrel-similar-notes)
Latest release (manual install assets): [v0.0.2](https://github.com/watthem/quarrel-similar-notes/releases/tag/v0.0.2)

Install manually by dropping the release files into `.obsidian/plugins/quarrel-similar-notes/`. Not yet in the community plugin directory.

[Upload screenshot: full app view]
[Upload screenshot: keyword chips + filters]
[Upload screenshot: expanded card with metadata]
[Upload screenshot: settings panel]

If you're interested, open an issue on the repo or reply here. I'd especially value feedback from people with 500+ note vaults — I want to understand how TF-IDF holds up at scale versus embedding-based approaches.

---

## Reddit r/obsidian Post

**Title**: Built a local-only similar notes plugin using TF-IDF — looking for feedback

---

I've been working on an Obsidian plugin that surfaces similar notes in a sidebar using TF-IDF (term frequency-inverse document frequency) instead of embeddings or API calls. Everything runs locally — no accounts, no network, no API keys.

The idea is that TF-IDF is transparent. You can reason about why a result appears (shared distinctive terms) rather than trusting a black box. The tradeoff is it won't catch semantic similarity the way embeddings do, but for a lot of vault navigation it works surprisingly well.

**Current features:**
- Auto-updating sidebar as you navigate notes
- Clickable keyword chips (top TF-IDF terms from current note) to filter results
- Stale index banner when your vault changes
- Experimental auto-reindex on file changes

I'm looking for design partners — people willing to try it and share honest feedback. Specifically interested in:

1. Does TF-IDF find useful connections in your vault?
2. Is the keyword chip interaction helpful or do you ignore it?
3. What vault size are you working with and how does performance feel?

GitHub: [quarrel-similar-notes](https://github.com/watthem/quarrel-similar-notes)
Release for manual install: [v0.0.2](https://github.com/watthem/quarrel-similar-notes/releases/tag/v0.0.2)

[Upload screenshot: full app view]
[Upload screenshot: keyword chips + filters]
[Upload screenshot: expanded card with metadata]
[Upload screenshot: settings panel]

Happy to answer questions about the approach or the underlying [quarrel](https://github.com/watthem/quarrel) library.

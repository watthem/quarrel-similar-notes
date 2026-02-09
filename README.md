# Quarrel Similar Notes

An Obsidian plugin that surfaces semantically similar notes in a sidebar panel. Powered by TF-IDF + cosine similarity via [@watthem/quarrel](https://github.com/watthem/quarrel).

## Features

- **Local-first**: All processing happens on-device. No network calls, no API keys.
- **Transparent**: Uses TF-IDF, a well-understood algorithm. You can understand why results appear.
- **Fast**: Near-instant queries once indexed. Handles large vaults efficiently.
- **Private**: Your notes never leave your vault.

## Installation

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/watthem/quarrel-similar-notes/releases) page
2. Extract to your vault's `.obsidian/plugins/quarrel-similar-notes/` directory
3. Reload Obsidian
4. Enable "Similar Notes" in Settings > Community Plugins

### From Community Plugins (Coming Soon)

Search for "Similar Notes" in Obsidian's Community Plugins browser.

## Usage

1. Open the Similar Notes panel from the ribbon icon or command palette
2. Navigate to any note - similar notes appear in the sidebar
3. Click a result to open that note

### Commands

- **Show similar notes panel** - Opens the similar notes sidebar
- **Rebuild similarity index** - Rebuilds the similarity index
- **Check for changes** - Shows how many notes have changed since last index build

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Max Results | 5 | Maximum similar notes to display |
| Min Similarity | 15% | Minimum similarity threshold |
| Hash Dimensions | 2048 | Vector size (higher = more precise, slower) |
| Content Length | 1500 | Characters of content to analyze per note |

## How It Works

Similar Notes uses TF-IDF (Term Frequency-Inverse Document Frequency) to find notes with similar content:

1. **Tokenize**: Extract meaningful words from each note
2. **Weight**: Score words by how unique they are to each note
3. **Compare**: Measure similarity using cosine distance

This approach finds notes that share distinctive terminology, not just common words.

## Privacy & Disclosures

This plugin follows Obsidian's recommended disclosure guidelines:

| Concern | Status |
|---------|--------|
| Network calls | **None** - All processing is 100% local |
| External APIs | **None** - No API keys or accounts required |
| Accounts | **None** - No sign-in required |
| Telemetry/Analytics | **None** - No tracking of any kind |
| External file access | **Vault only** - Reads note content and writes the similarity index to the plugin data folder |
| Data storage | Index stored locally in vault's plugin data folder |
| Dependencies | [@watthem/quarrel](https://github.com/watthem/quarrel) (MIT, no network) |
| Payments | **None** - Fully free and open source |
| Ads | **None** |
| Closed-source components | **None** |

Your notes never leave your device.

## Development

```bash
# Clone the repo
git clone https://github.com/watthem/quarrel-similar-notes.git

# Install dependencies
npm install

# Build for development (with watch mode)
npm run dev

# Build for production
npm run build
```

## License

MIT - See [LICENSE](LICENSE) for details.

## Credits

- Similarity engine: [@watthem/quarrel](https://github.com/watthem/quarrel)
- Inspired by the need for a transparent, local-first alternative to embedding-based plugins

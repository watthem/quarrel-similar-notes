# Feedback checklist (Obsidian plugin guidelines)

This is a working checklist distilled from Obsidian's plugin guidelines and reviewed against the current repo structure.
Use it to track fixes and keep releases aligned with the official expectations.

## Current status snapshot
- README exists at repo root.
- LICENSE exists.
- `manifest.json` uses a unique `id` ("quarrel-similar-notes").
- `main.js` is ignored via `.gitignore`.
- Source exists in `src/` and builds via `esbuild.config.mjs`.

## Release + repo hygiene
- [x] README.md exists at repo root and explains the plugin, usage, and limitations.
- [x] LICENSE exists at repo root.
- [x] manifest.json has a unique `id` and a clear `name`. (`id: "quarrel-similar-notes"`.)
- [x] manifest.json `version` uses semantic versioning (e.g., 0.1.0).
- [x] Do not commit `main.js` to the repo; include it only in GitHub releases. (`main.js` is ignored.)
- [ ] Release assets include: `main.js`, `manifest.json`, and `styles.css` (if used).
- [x] Consider adding `fundingUrl` in manifest.json.
- [x] Ensure `versions.json` exists if the `version` script expects it.

## Naming + commands
- [x] Remove placeholder names (e.g., MyPlugin, SampleSettingTab).
- [x] Avoid "Obsidian" in the plugin name unless necessary.
- [x] Do not include plugin name or plugin ID in command names (Obsidian adds it).

## Compatibility + platform
- [x] No default hotkeys for commands.
- [x] Do not override core styling; scope styles to your plugin classes.
- [x] Avoid hardcoded `.obsidian` paths; use `Vault.configDir`. (Not used.)
- [x] `isDesktopOnly` is false and no top-level imports of `fs`, `path`, or `electron`.
- [ ] Avoid regex lookbehinds if supporting iOS < 16.4. (None currently.)
- [ ] Use `Platform` instead of `process.platform` if needed. (Not used.)

## Networking
- [x] No network calls; `requestUrl` not needed.

## Coding style + safety
- [x] No `var`; use `let` or `const`.
- [x] Avoid global `app`; use `this.app` inside plugin.
- [x] Avoid global variables in general.
- [x] Prefer `async/await` over raw Promises.
- [x] Avoid `as any`; use proper typing.
- [x] Use `instanceof` before casting to `TFile` or other vault types.
- [ ] Remove unnecessary `console.log`. (None present.)
- [x] Use Obsidian's `Notice` import instead of a `declare function Notice` shim in `src/main.ts`.

## Security + disclosures
- [x] Dependencies are minimal.
- [ ] README discloses payments, accounts, network use, external file access, ads, telemetry (with privacy policy), and any closed-source components.
- [x] Avoid telemetry libraries entirely.
- [x] Commit a lock file (npm/pnpm/yarn). (`package-lock.json` is present.)

## API usage
- [x] Avoid `Vault.modify` when editing notes; prefer `Editor` or `Vault.process`. (Not used.)
- [x] Do not manually edit frontmatter; use `FileManager.processFrontMatter`. (Not used.)
- [x] Use `trashFile` instead of `vault.delete`. (Not used.)
- [x] Prefer Vault API over Adapter API.
- [x] Use `Plugin.loadData()` / `saveData()` for plugin data.
- [x] Use `normalizePath()` for user-provided paths. (Not used.)

## Performance
- [x] Minify production `main.js` release. (Enabled in esbuild for production.)
- [x] Avoid heavy work in `onload()`; defer to `workspace.onLayoutReady()`. (Index builds on layout ready.)
- [x] Avoid scanning all files to resolve a path. (No path scanning.)
- [x] Use Obsidian's `moment` import instead of bundling another copy. (Not used.)

## UI/UX
- [x] Use sentence case for UI text. (Mostly OK.)
- [x] Avoid settings headings unless there are multiple sections. (There are sections, OK.)
- [x] Do not put "settings" or "options" in heading titles.
- [x] Use `setHeading()` instead of raw `<h2>` / `<h3>` in settings.

## Local-first ethos (project-specific)
- [x] Confirm the plugin does not send note content off-device.
- [x] Include a short privacy statement in README.
- [x] Prefer local indexing and explicit rebuilds over background sync.

## Next pass (recommended)
- [ ] Ensure release assets include `main.js`, `manifest.json`, `styles.css`.

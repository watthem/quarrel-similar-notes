import { Notice, Plugin, TAbstractFile, TFile, WorkspaceLeaf } from "obsidian";
import { SimilarNotesIndex } from "./index";
import { SimilarNotesView, VIEW_TYPE_SIMILAR_NOTES } from "./SimilarNotesView";
import {
  SimilarNotesSettings,
  SimilarNotesSettingTab,
  DEFAULT_SETTINGS,
} from "./settings";

export default class SimilarNotesPlugin extends Plugin {
  settings: SimilarNotesSettings = DEFAULT_SETTINGS;
  index: SimilarNotesIndex | null = null;
  pendingChanges: Set<string> = new Set();
  private autoReindexTimer: number | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Initialize the similarity index
    this.index = new SimilarNotesIndex(this.app, {
      maxResults: this.settings.maxResults,
      minSimilarity: this.settings.minSimilarity / 100,
      useHashing: true,
      hashDim: this.settings.hashDim,
      contentExcerptLength: this.settings.contentExcerptLength,
    });

    // Register the sidebar view
    this.registerView(VIEW_TYPE_SIMILAR_NOTES, (leaf) => new SimilarNotesView(leaf, this));

    // Add ribbon icon
    this.addRibbonIcon("file-search", "Similar Notes", () => {
      this.activateView();
    });

    // Add commands
    this.addCommand({
      id: "show-similar-notes",
      name: "Show similar notes panel",
      callback: () => {
        this.activateView();
      },
    });

    this.addCommand({
      id: "rebuild-index",
      name: "Rebuild similarity index",
      callback: async () => {
        await this.rebuildIndex();
      },
    });

    this.addCommand({
      id: "check-for-changes",
      name: "Check for changes",
      callback: async () => {
        const changes = await this.index?.checkForChanges();
        if (changes) {
          const total = changes.added + changes.modified + changes.deleted;
          if (total > 0) {
            // eslint-disable-next-line no-new
            new Notice(
              `Found ${total} changes: ${changes.added} added, ${changes.modified} modified, ${changes.deleted} deleted`
            );
          } else {
            // eslint-disable-next-line no-new
            new Notice("Index is up to date");
          }
        }
      },
    });

    // Add settings tab
    this.addSettingTab(new SimilarNotesSettingTab(this.app, this));

    // Build index on layout ready (after vault is loaded)
    this.app.workspace.onLayoutReady(async () => {
      await this.index?.buildIndex();

      // Open panel on start if configured
      if (this.settings.openOnStart) {
        this.activateView();
      }

      this.registerVaultListeners();
    });
  }

  onunload(): void {
    if (this.autoReindexTimer !== null) {
      window.clearTimeout(this.autoReindexTimer);
      this.autoReindexTimer = null;
    }
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_SIMILAR_NOTES);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);

    // Update index options
    if (this.index) {
      this.index.updateOptions({
        maxResults: this.settings.maxResults,
        minSimilarity: this.settings.minSimilarity / 100,
        hashDim: this.settings.hashDim,
        contentExcerptLength: this.settings.contentExcerptLength,
      });
    }
  }

  async rebuildIndex(silent = false): Promise<void> {
    if (!this.index) return;

    if (!silent) {
      // eslint-disable-next-line no-new
      new Notice("Building similarity index...");
    }
    await this.index.buildIndex();
    if (!silent) {
      // eslint-disable-next-line no-new
      new Notice(`Index built: ${this.index.getDocumentCount()} notes`);
    }

    this.pendingChanges.clear();
    if (this.autoReindexTimer !== null) {
      window.clearTimeout(this.autoReindexTimer);
      this.autoReindexTimer = null;
    }

    this.refreshViews();
  }

  private refreshViews(): void {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_SIMILAR_NOTES).forEach((leaf) => {
      if (leaf.view instanceof SimilarNotesView) {
        leaf.view.refresh();
      }
    });
  }

  private registerVaultListeners(): void {
    const trackChange = (file: TAbstractFile) => {
      if (!(file instanceof TFile) || file.extension !== "md") return;
      this.pendingChanges.add(file.path);

      if (this.settings.autoReindex) {
        if (this.autoReindexTimer !== null) {
          window.clearTimeout(this.autoReindexTimer);
        }
        this.autoReindexTimer = window.setTimeout(() => {
          this.rebuildIndex(true);
        }, this.settings.autoReindexDelay * 1000);
      }
    };

    this.registerEvent(this.app.vault.on("create", trackChange));
    this.registerEvent(this.app.vault.on("modify", trackChange));
    this.registerEvent(this.app.vault.on("delete", trackChange));
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_SIMILAR_NOTES);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_SIMILAR_NOTES,
          active: true,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
}

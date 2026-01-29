import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import type SimilarNotesPlugin from "./main";
import type { SimilarNote } from "./index";

export const VIEW_TYPE_SIMILAR_NOTES = "similar-notes-view";

export class SimilarNotesView extends ItemView {
  plugin: SimilarNotesPlugin;
  private contentEl: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: SimilarNotesPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.contentEl = this.containerEl.children[1] as HTMLElement;
  }

  getViewType(): string {
    return VIEW_TYPE_SIMILAR_NOTES;
  }

  getDisplayText(): string {
    return "Similar Notes";
  }

  getIcon(): string {
    return "file-search";
  }

  async onOpen(): Promise<void> {
    this.contentEl.empty();
    this.contentEl.addClass("similar-notes-container");

    // Register for active file changes
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.refresh();
      })
    );

    this.refresh();
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }

  refresh(): void {
    this.contentEl.empty();

    const activeFile = this.app.workspace.getActiveFile();

    if (!activeFile) {
      this.renderEmptyState("No active note");
      return;
    }

    if (!this.plugin.index || this.plugin.index.getDocumentCount() === 0) {
      this.renderEmptyState("Index not built", "Use the command palette to rebuild the index.");
      return;
    }

    const results = this.plugin.index.getSimilarNotes(activeFile);

    if (results.length === 0) {
      this.renderEmptyState("No similar notes found");
      return;
    }

    this.renderResults(results);
  }

  private renderEmptyState(title: string, description?: string): void {
    const emptyEl = this.contentEl.createDiv({ cls: "similar-notes-empty" });
    emptyEl.createEl("p", { text: title, cls: "similar-notes-empty-title" });
    if (description) {
      emptyEl.createEl("p", { text: description, cls: "similar-notes-empty-desc" });
    }
  }

  private renderResults(results: SimilarNote[]): void {
    const listEl = this.contentEl.createEl("ul", { cls: "similar-notes-list" });

    for (const result of results) {
      const itemEl = listEl.createEl("li", { cls: "similar-notes-item" });

      const linkEl = itemEl.createEl("a", {
        cls: "similar-notes-link",
        href: "#",
      });

      linkEl.createEl("span", {
        text: result.title,
        cls: "similar-notes-title",
      });

      linkEl.createEl("span", {
        text: `${result.percentage}%`,
        cls: "similar-notes-score",
      });

      linkEl.addEventListener("click", (e) => {
        e.preventDefault();
        const file = this.app.vault.getAbstractFileByPath(result.path);
        if (file instanceof TFile) {
          this.app.workspace.getLeaf().openFile(file);
        }
      });
    }

    // Status footer
    const lastBuilt = this.plugin.index?.getLastBuilt();
    if (lastBuilt) {
      const footerEl = this.contentEl.createDiv({ cls: "similar-notes-footer" });
      footerEl.createEl("small", {
        text: `Indexed ${lastBuilt.toLocaleTimeString()}`,
      });
    }
  }
}

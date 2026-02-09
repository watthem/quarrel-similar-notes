import { ItemView, WorkspaceLeaf, TFile, setIcon } from "obsidian";
import type SimilarNotesPlugin from "./main";
import type { SimilarNote } from "./index";

export const VIEW_TYPE_SIMILAR_NOTES = "similar-notes-view";

export class SimilarNotesView extends ItemView {
  plugin: SimilarNotesPlugin;
  private contentEl: HTMLElement;
  private activeChips: Set<string> = new Set();

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

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.activeChips.clear();
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
    const keywords = this.plugin.index.getKeywords(activeFile);

    if (results.length === 0) {
      this.renderHeader(0);
      this.renderKeywordChips(keywords);
      this.renderEmptyState("No similar notes found");
      this.renderFooter();
      return;
    }

    this.renderHeader(results.length);
    this.renderKeywordChips(keywords);
    this.renderCards(results);
    this.renderFooter();
  }

  // ── Header ──────────────────────────────────────────────

  private renderHeader(count: number): void {
    const header = this.contentEl.createDiv({ cls: "sn-header" });

    const left = header.createDiv({ cls: "sn-header-left" });
    left.createEl("h4", { text: "Quarrel Similar Notes", cls: "sn-title" });
    left.createEl("span", {
      text: `${count} similar note${count !== 1 ? "s" : ""}`,
      cls: "sn-count",
    });

    const refreshBtn = header.createDiv({ cls: "sn-refresh-btn clickable-icon" });
    setIcon(refreshBtn, "refresh-cw");
    refreshBtn.setAttribute("aria-label", "Re-index vault");
    refreshBtn.addEventListener("click", () => {
      this.plugin.rebuildIndex();
    });
  }

  // ── Keyword Chips ───────────────────────────────────────

  private renderKeywordChips(keywords: string[]): void {
    if (keywords.length === 0) return;

    const chipsRow = this.contentEl.createDiv({ cls: "sn-chips" });

    for (const kw of keywords) {
      const chip = chipsRow.createEl("button", {
        text: kw,
        cls: "sn-chip",
      });

      if (this.activeChips.has(kw)) {
        chip.addClass("sn-chip-active");
      }

      chip.addEventListener("click", () => {
        if (this.activeChips.has(kw)) {
          this.activeChips.delete(kw);
        } else {
          this.activeChips.add(kw);
        }
        this.refresh();
      });
    }

    if (this.activeChips.size > 0) {
      const resetBtn = chipsRow.createEl("button", {
        text: "reset",
        cls: "sn-chip sn-chip-reset",
      });
      resetBtn.addEventListener("click", () => {
        this.activeChips.clear();
        this.refresh();
      });
    }
  }

  // ── Note Cards ──────────────────────────────────────────

  private renderCards(results: SimilarNote[]): void {
    const list = this.contentEl.createDiv({ cls: "sn-cards" });

    // Sort/filter by active chips if any
    let filtered = results;
    if (this.activeChips.size > 0) {
      const chipTerms = [...this.activeChips];
      filtered = results
        .map((r) => {
          const lowerTitle = r.title.toLowerCase();
          const lowerSnippet = r.snippet.toLowerCase();
          const lowerTags = r.tags.map((t) => t.toLowerCase());
          let boost = 0;
          for (const term of chipTerms) {
            const lt = term.toLowerCase();
            if (lowerTitle.includes(lt)) boost += 2;
            if (lowerSnippet.includes(lt)) boost += 1;
            if (lowerTags.some((tag) => tag.includes(lt))) boost += 1.5;
          }
          return { ...r, boost };
        })
        .sort((a, b) => b.boost - a.boost || b.percentage - a.percentage);
    }

    for (let i = 0; i < filtered.length; i++) {
      this.renderCard(list, filtered[i], i === 0);
    }
  }

  private renderCard(parent: HTMLElement, note: SimilarNote, expanded: boolean): void {
    const card = parent.createDiv({ cls: "sn-card" });

    // ── Collapsed (always visible) ────────────────────────
    const summary = card.createDiv({ cls: "sn-card-summary" });
    summary.addEventListener("click", () => {
      card.toggleClass("sn-card-open", !card.hasClass("sn-card-open"));
    });

    // Top row: title + date
    const topRow = summary.createDiv({ cls: "sn-card-top" });
    topRow.createEl("span", { text: note.title, cls: "sn-card-title" });

    const dateStr = this.formatDate(note);
    if (dateStr) {
      topRow.createEl("span", { text: dateStr, cls: "sn-card-date" });
    }

    // Progress bar row
    const barRow = summary.createDiv({ cls: "sn-card-bar-row" });
    const barTrack = barRow.createDiv({ cls: "sn-bar-track" });
    const barFill = barTrack.createDiv({ cls: "sn-bar-fill" });
    barFill.style.width = `${note.percentage}%`;
    barRow.createEl("span", {
      text: `${note.percentage}%`,
      cls: "sn-card-pct",
    });

    // ── Expanded detail ───────────────────────────────────
    const detail = card.createDiv({ cls: "sn-card-detail" });

    if (note.snippet) {
      detail.createEl("p", { text: note.snippet, cls: "sn-card-snippet" });
    }

    // Tags
    if (note.tags.length > 0) {
      const tagsRow = detail.createDiv({ cls: "sn-card-tags" });
      for (const tag of note.tags) {
        tagsRow.createEl("span", { text: tag, cls: "sn-tag" });
      }
    }

    // Actions
    const actions = detail.createDiv({ cls: "sn-card-actions" });
    const openBtn = actions.createEl("button", {
      text: "Open note",
      cls: "sn-action-btn",
    });
    openBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const file = this.app.vault.getAbstractFileByPath(note.path);
      if (file instanceof TFile) {
        this.app.workspace.getLeaf().openFile(file);
      }
    });

    // Default first card open
    if (expanded) {
      card.addClass("sn-card-open");
    }

    // Clicking the title area also navigates
    const titleEl = summary.querySelector(".sn-card-title") as HTMLElement;
    if (titleEl) {
      titleEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const file = this.app.vault.getAbstractFileByPath(note.path);
        if (file instanceof TFile) {
          this.app.workspace.getLeaf().openFile(file);
        }
      });
    }
  }

  // ── Footer (Filters + Index Status) ────────────────────

  private renderFooter(): void {
    const footer = this.contentEl.createDiv({ cls: "sn-footer" });

    // Filters section
    this.renderFiltersSection(footer);

    // Index status section
    this.renderIndexStatus(footer);
  }

  private renderFiltersSection(parent: HTMLElement): void {
    const details = parent.createEl("details", { cls: "sn-collapsible" });
    const summary = details.createEl("summary", { cls: "sn-collapsible-title" });
    summary.textContent = "Filters";

    const body = details.createDiv({ cls: "sn-collapsible-body" });

    // Max results
    const maxRow = body.createDiv({ cls: "sn-filter-row" });
    maxRow.createEl("label", { text: "Max results" });
    const maxInput = maxRow.createEl("input", { type: "number" });
    maxInput.type = "number";
    maxInput.min = "1";
    maxInput.max = "20";
    maxInput.value = String(this.plugin.settings.maxResults);
    maxInput.addEventListener("change", async () => {
      this.plugin.settings.maxResults = parseInt(maxInput.value) || 5;
      await this.plugin.saveSettings();
      this.refresh();
    });

    // Min similarity
    const simRow = body.createDiv({ cls: "sn-filter-row" });
    simRow.createEl("label", { text: "Min similarity (%)" });
    const simInput = simRow.createEl("input", { type: "number" });
    simInput.type = "number";
    simInput.min = "0";
    simInput.max = "50";
    simInput.step = "5";
    simInput.value = String(this.plugin.settings.minSimilarity);
    simInput.addEventListener("change", async () => {
      this.plugin.settings.minSimilarity = parseInt(simInput.value) || 15;
      await this.plugin.saveSettings();
      this.refresh();
    });
  }

  private renderIndexStatus(parent: HTMLElement): void {
    const lastBuilt = this.plugin.index?.getLastBuilt();
    const docCount = this.plugin.index?.getDocumentCount() ?? 0;

    const statusDiv = parent.createDiv({ cls: "sn-index-status" });

    if (lastBuilt) {
      statusDiv.createEl("span", {
        text: `Index status: ${docCount} notes indexed at ${lastBuilt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
        cls: "sn-status-text",
      });
    } else {
      statusDiv.createEl("span", {
        text: "Index not built",
        cls: "sn-status-text",
      });
    }

    const reindexLink = statusDiv.createEl("a", {
      text: "Re-index now",
      cls: "sn-reindex-link",
      href: "#",
    });
    reindexLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.plugin.rebuildIndex();
    });
  }

  // ── Helpers ─────────────────────────────────────────────

  private renderEmptyState(title: string, description?: string): void {
    const emptyEl = this.contentEl.createDiv({ cls: "similar-notes-empty" });
    emptyEl.createEl("p", { text: title, cls: "similar-notes-empty-title" });
    if (description) {
      emptyEl.createEl("p", { text: description, cls: "similar-notes-empty-desc" });
    }
  }

  private formatDate(note: SimilarNote): string {
    if (!note.date) return "";
    const now = new Date();
    const d = note.date;
    // If same year, show "Mon DD"; otherwise "Mon DD, YYYY"
    const opts: Intl.DateTimeFormatOptions =
      d.getFullYear() === now.getFullYear()
        ? { month: "short", day: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" };
    return d.toLocaleDateString(undefined, opts);
  }
}

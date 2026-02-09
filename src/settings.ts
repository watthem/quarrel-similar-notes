import { App, PluginSettingTab, Setting } from "obsidian";
import type SimilarNotesPlugin from "./main";

export interface SimilarNotesSettings {
  maxResults: number;
  minSimilarity: number;
  hashDim: number;
  contentExcerptLength: number;
  openOnStart: boolean;
  autoReindex: boolean;
  autoReindexDelay: number;
}

export const DEFAULT_SETTINGS: SimilarNotesSettings = {
  maxResults: 5,
  minSimilarity: 15,
  hashDim: 2048,
  contentExcerptLength: 1500,
  openOnStart: false,
  autoReindex: false,
  autoReindexDelay: 30,
};

export class SimilarNotesSettingTab extends PluginSettingTab {
  plugin: SimilarNotesPlugin;

  constructor(app: App, plugin: SimilarNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setHeading().setName("Similar notes");

    new Setting(containerEl)
      .setName("Maximum results")
      .setDesc("Maximum number of similar notes to display")
      .addSlider((slider) =>
        slider
          .setLimits(1, 20, 1)
          .setValue(this.plugin.settings.maxResults)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxResults = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Minimum similarity")
      .setDesc("Minimum similarity threshold (percentage)")
      .addSlider((slider) =>
        slider
          .setLimits(0, 50, 5)
          .setValue(this.plugin.settings.minSimilarity)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.minSimilarity = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Hash dimensions")
      .setDesc("Vector size for similarity index. Higher = more precise but slower. Requires rebuild.")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            "512": "512 (faster)",
            "1024": "1024",
            "2048": "2048 (default)",
            "4096": "4096 (more precise)",
          })
          .setValue(String(this.plugin.settings.hashDim))
          .onChange(async (value) => {
            this.plugin.settings.hashDim = parseInt(value);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Content excerpt length")
      .setDesc("Characters of note content to analyze. Requires rebuild.")
      .addSlider((slider) =>
        slider
          .setLimits(500, 5000, 500)
          .setValue(this.plugin.settings.contentExcerptLength)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.contentExcerptLength = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Open panel on start")
      .setDesc("Automatically open the Similar Notes panel when Obsidian starts")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.openOnStart).onChange(async (value) => {
          this.plugin.settings.openOnStart = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl).setHeading().setName("Experimental");

    new Setting(containerEl)
      .setName("Auto-reindex on changes")
      .setDesc("Automatically rebuild the index when notes change. May impact performance on large vaults.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.autoReindex).onChange(async (value) => {
          this.plugin.settings.autoReindex = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Auto-reindex delay")
      .setDesc("Seconds to wait after last change before auto-reindexing")
      .addSlider((slider) =>
        slider
          .setLimits(5, 120, 5)
          .setValue(this.plugin.settings.autoReindexDelay)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.autoReindexDelay = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setHeading().setName("Index management");

    new Setting(containerEl)
      .setName("Rebuild index")
      .setDesc("Rebuild the similarity index for all notes")
      .addButton((button) =>
        button.setButtonText("Rebuild").onClick(async () => {
          button.setButtonText("Building...");
          button.setDisabled(true);
          await this.plugin.rebuildIndex();
          button.setButtonText("Rebuild");
          button.setDisabled(false);
        })
      );

    const statusEl = containerEl.createEl("p", { cls: "setting-item-description" });
    this.updateStatus(statusEl);
  }

  private updateStatus(el: HTMLElement): void {
    const lastBuilt = this.plugin.index?.getLastBuilt();
    const docCount = this.plugin.index?.getDocumentCount() ?? 0;

    if (lastBuilt) {
      el.textContent = `Index: ${docCount} notes, last built ${lastBuilt.toLocaleString()}`;
    } else {
      el.textContent = "Index not built. Click Rebuild to create the index.";
    }
  }
}

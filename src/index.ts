import { App, TFile } from "obsidian";
import * as quarrel from "@watthem/quarrel";

export interface SimilarNotesOptions {
  maxResults: number;
  minSimilarity: number;
  useHashing: boolean;
  hashDim: number;
  contentExcerptLength: number;
}

export interface SimilarNote {
  path: string;
  title: string;
  similarity: number;
  percentage: number;
}

interface IndexedDocument {
  id: string;
  title: string;
  path: string;
  content: string;
  fingerprint: string;
}

export class SimilarNotesIndex {
  private app: App;
  private options: SimilarNotesOptions;
  private documents: IndexedDocument[] = [];
  private vectors: number[][] = [];
  private lastBuilt: Date | null = null;

  constructor(app: App, options: Partial<SimilarNotesOptions> = {}) {
    this.app = app;
    this.options = {
      maxResults: 5,
      minSimilarity: 0.15,
      useHashing: true,
      hashDim: 2048,
      contentExcerptLength: 1500,
      ...options,
    };
  }

  /**
   * Build or rebuild the similarity index from all vault files
   */
  async buildIndex(): Promise<void> {
    const markdownFiles = this.app.vault.getMarkdownFiles();

    this.documents = await Promise.all(
      markdownFiles.map(async (file) => {
        const content = await this.app.vault.cachedRead(file);
        return {
          id: file.path,
          title: file.basename,
          path: file.path,
          content,
          fingerprint: quarrel.fingerprintText(content),
        };
      })
    );

    if (this.documents.length === 0) {
      this.vectors = [];
      return;
    }

    const { vectors } = quarrel.vectorizeDocuments(this.documents, {
      useHashing: this.options.useHashing,
      hashDim: this.options.hashDim,
      contentExcerptLength: this.options.contentExcerptLength,
    });

    this.vectors = vectors;
    this.lastBuilt = new Date();
  }

  /**
   * Check if the index needs rebuilding
   */
  async checkForChanges(): Promise<{ added: number; modified: number; deleted: number }> {
    const currentFiles = this.app.vault.getMarkdownFiles();
    const currentPaths = new Set(currentFiles.map((f) => f.path));
    const indexedPaths = new Set(this.documents.map((d) => d.path));

    let added = 0;
    let modified = 0;
    let deleted = 0;

    // Check for new files
    for (const file of currentFiles) {
      if (!indexedPaths.has(file.path)) {
        added++;
      } else {
        // Check if content changed
        const content = await this.app.vault.cachedRead(file);
        const newFingerprint = quarrel.fingerprintText(content);
        const doc = this.documents.find((d) => d.path === file.path);
        if (doc && doc.fingerprint !== newFingerprint) {
          modified++;
        }
      }
    }

    // Check for deleted files
    for (const doc of this.documents) {
      if (!currentPaths.has(doc.path)) {
        deleted++;
      }
    }

    return { added, modified, deleted };
  }

  /**
   * Find similar notes for a given file
   */
  findSimilar(file: TFile, limit?: number): Array<{ file: IndexedDocument; score: number }> {
    if (this.documents.length === 0 || this.vectors.length === 0) {
      return [];
    }

    const maxResults = limit ?? this.options.maxResults;
    const docIdx = this.documents.findIndex((d) => d.path === file.path);

    if (docIdx === -1) {
      return [];
    }

    const currentVector = this.vectors[docIdx];

    const scores = this.documents
      .map((doc, idx) => ({
        file: doc,
        score: quarrel.cosineSimilarity(currentVector, this.vectors[idx]),
        isSelf: idx === docIdx,
      }))
      .filter((s) => !s.isSelf && s.score >= this.options.minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return scores.map(({ file, score }) => ({ file, score }));
  }

  /**
   * Find similar notes for the currently active file
   */
  findSimilarForCurrent(): Array<{ file: IndexedDocument; score: number }> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      return [];
    }
    return this.findSimilar(activeFile);
  }

  /**
   * Get similar notes in a structured format for display
   */
  getSimilarNotes(file: TFile): SimilarNote[] {
    const results = this.findSimilar(file);
    return results.map((r) => ({
      path: r.file.path,
      title: r.file.title,
      similarity: r.score,
      percentage: Math.round(r.score * 100),
    }));
  }

  /**
   * Get the last build time
   */
  getLastBuilt(): Date | null {
    return this.lastBuilt;
  }

  /**
   * Get the number of indexed documents
   */
  getDocumentCount(): number {
    return this.documents.length;
  }

  /**
   * Update options (requires rebuild for some changes)
   */
  updateOptions(options: Partial<SimilarNotesOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

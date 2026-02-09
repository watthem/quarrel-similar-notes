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
  snippet: string;
  tags: string[];
  date: Date | null;
  folder: string;
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
   * Extract top TF-IDF keywords from a note for chip display.
   * Computes term frequency in the note and inverse document frequency
   * across the corpus to surface the most distinctive terms.
   */
  getKeywords(file: TFile, count = 6): string[] {
    const docIdx = this.documents.findIndex((d) => d.path === file.path);
    if (docIdx === -1 || this.documents.length === 0) {
      return [];
    }

    const doc = this.documents[docIdx];
    const tokens = quarrel.tokenize(quarrel.normalizeMarkdown(doc.content));

    if (tokens.length === 0) return [];

    // Term frequency for this document
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }

    // Document frequency across corpus
    const df = new Map<string, number>();
    for (const d of this.documents) {
      const docTokens = new Set(quarrel.tokenize(quarrel.normalizeMarkdown(d.content)));
      for (const t of docTokens) {
        df.set(t, (df.get(t) ?? 0) + 1);
      }
    }

    const n = this.documents.length;
    const scored: Array<{ term: string; score: number }> = [];

    for (const [term, freq] of tf) {
      const idf = Math.log((n + 1) / ((df.get(term) ?? 0) + 1)) + 1;
      scored.push({ term, score: freq * idf });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map((s) => s.term);
  }

  /**
   * Get similar notes in a structured format for display, with metadata
   */
  getSimilarNotes(file: TFile): SimilarNote[] {
    const results = this.findSimilar(file);
    return results.map((r) => {
      const obsFile = this.app.vault.getAbstractFileByPath(r.file.path);
      const metadata =
        obsFile instanceof TFile
          ? this.app.metadataCache.getFileCache(obsFile)
          : null;

      // Extract snippet: first non-empty paragraph of content
      const snippet = this.extractSnippet(r.file.content);

      // Extract tags from frontmatter and inline
      const tags: string[] = [];
      if (metadata?.frontmatter?.tags) {
        const fmTags = metadata.frontmatter.tags;
        if (Array.isArray(fmTags)) {
          tags.push(...fmTags);
        } else if (typeof fmTags === "string") {
          tags.push(fmTags);
        }
      }
      if (metadata?.tags) {
        for (const t of metadata.tags) {
          const clean = t.tag.replace(/^#/, "");
          if (!tags.includes(clean)) tags.push(clean);
        }
      }

      // Date: prefer frontmatter date, fallback to file stat
      let date: Date | null = null;
      if (obsFile instanceof TFile) {
        date = new Date(obsFile.stat.mtime);
      }

      // Folder
      const folder = r.file.path.contains("/")
        ? r.file.path.substring(0, r.file.path.lastIndexOf("/"))
        : "";

      // Title: prefer frontmatter title
      const title = metadata?.frontmatter?.title ?? r.file.title;

      return {
        path: r.file.path,
        title,
        similarity: r.score,
        percentage: Math.round(r.score * 100),
        snippet,
        tags,
        date,
        folder,
      };
    });
  }

  /**
   * Extract a short snippet from note content
   */
  private extractSnippet(content: string, maxLen = 120): string {
    // Strip frontmatter
    const stripped = quarrel.stripFrontmatter(content);
    // Find first non-empty, non-heading line
    const lines = stripped.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("---") &&
        !trimmed.startsWith("```")
      ) {
        if (trimmed.length > maxLen) {
          return trimmed.substring(0, maxLen) + " ...";
        }
        return trimmed;
      }
    }
    return "";
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

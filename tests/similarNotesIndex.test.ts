import type { App, TFile } from "obsidian";
import { describe, expect, it, vi } from "vitest";
import { SimilarNotesIndex } from "../src/index";

vi.mock("obsidian", () => ({
  TFile: class TFile {},
}));

type MockFile = {
  path: string;
  basename: string;
};

type MockApp = {
  vault: {
    getMarkdownFiles: () => MockFile[];
    cachedRead: (file: MockFile) => Promise<string>;
  };
  workspace: {
    getActiveFile: () => MockFile | null;
  };
};

function createMockApp(initial: Record<string, string>) {
  let files = toFiles(initial);
  let contents = new Map(Object.entries(initial));
  let activeFile: MockFile | null = files[0] ?? null;

  const app: MockApp = {
    vault: {
      getMarkdownFiles: () => files,
      cachedRead: async (file) => contents.get(file.path) ?? "",
    },
    workspace: {
      getActiveFile: () => activeFile,
    },
  };

  const setFiles = (next: Record<string, string>) => {
    files = toFiles(next);
    contents = new Map(Object.entries(next));
    activeFile = files[0] ?? null;
  };

  const setActive = (path: string) => {
    activeFile = files.find((file) => file.path === path) ?? null;
  };

  const getFile = (path: string) => files.find((file) => file.path === path) ?? null;

  return { app, setFiles, setActive, getFile };
}

function toFiles(input: Record<string, string>): MockFile[] {
  return Object.keys(input).map((path) => ({
    path,
    basename: path.replace(/\.md$/i, ""),
  }));
}

describe("SimilarNotesIndex", () => {
  it("builds an index for markdown files", async () => {
    const { app } = createMockApp({
      "notes/a.md": "JavaScript closures and scope",
      "notes/b.md": "Closures in JavaScript are useful",
    });

    const index = new SimilarNotesIndex(app as unknown as App, { minSimilarity: 0.1 });
    await index.buildIndex();

    expect(index.getDocumentCount()).toBe(2);
    expect(index.getLastBuilt()).toBeInstanceOf(Date);
  });

  it("returns similar notes ordered by score", async () => {
    const { app, getFile } = createMockApp({
      "notes/a.md": "JavaScript closures and scope",
      "notes/b.md": "Closures in JavaScript and function scope",
      "notes/c.md": "Bananas apples oranges",
    });

    const index = new SimilarNotesIndex(app as unknown as App, {
      minSimilarity: 0.05,
      maxResults: 2,
    });
    await index.buildIndex();

    const file = getFile("notes/a.md");
    expect(file).not.toBeNull();

    const results = index.getSimilarNotes(file as unknown as TFile);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].path).toBe("notes/b.md");
    expect(results[0].similarity).toBeGreaterThan(results[results.length - 1].similarity);
  });

  it("detects added, modified, and deleted files", async () => {
    const { app, setFiles } = createMockApp({
      "notes/a.md": "JavaScript closures",
      "notes/b.md": "Python decorators",
    });

    const index = new SimilarNotesIndex(app as unknown as App, { minSimilarity: 0.1 });
    await index.buildIndex();

    setFiles({
      "notes/a.md": "JavaScript closures updated",
      "notes/c.md": "Rust ownership",
    });

    const changes = await index.checkForChanges();
    expect(changes.added).toBe(1);
    expect(changes.modified).toBe(1);
    expect(changes.deleted).toBe(1);
  });

  it("handles empty vaults", async () => {
    const { app } = createMockApp({});
    const index = new SimilarNotesIndex(app as unknown as App, { minSimilarity: 0.1 });
    await index.buildIndex();

    expect(index.getDocumentCount()).toBe(0);
    expect(index.getLastBuilt()).toBeNull();
  });
});

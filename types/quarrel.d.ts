declare module "@watthem/quarrel" {
  export interface TokenizeOptions {
    minTokenLength?: number;
    stopwords?: Set<string>;
  }

  export interface EmbeddingTextOptions {
    contentExcerptLength?: number;
  }

  export interface TfidfOptions extends TokenizeOptions {
    maxVocab?: number;
  }

  export interface HashedTfidfOptions extends TokenizeOptions {
    hashDim?: number;
  }

  export interface VectorizeDocument {
    id: string;
    title?: string;
    content: string;
  }

  export interface VectorizeOptions extends TokenizeOptions {
    contentExcerptLength?: number;
    maxVocab?: number;
    useHashing?: boolean;
    hashDim?: number;
  }

  export function stripFrontmatter(text: string): string;
  export function normalizeMarkdown(text: string): string;
  export function tokenize(text: string, options?: TokenizeOptions): string[];
  export function buildEmbeddingText(
    input: { title?: string; content: string },
    options?: EmbeddingTextOptions
  ): string;
  export function buildTfidfVectors(
    texts: string[],
    options?: TfidfOptions
  ): { vectors: number[][]; vocab: string[] };
  export function buildHashedTfidfVectors(
    texts: string[],
    options?: HashedTfidfOptions
  ): { vectors: number[][] };
  export function vectorizeDocuments(
    docs: VectorizeDocument[],
    options?: VectorizeOptions
  ): { vectors: number[][]; vocab?: string[]; texts: string[] };
  export function fingerprintText(text: string): string;
  export function cosineSimilarity(vecA: number[], vecB: number[]): number;
  export function calculateSimilarities(
    items: Array<{ id: string; title: string; embedding: number[] }>,
    options?: { maxSimilar?: number }
  ): Record<string, Array<{ id: string; title: string; similarity: number }>>;
}

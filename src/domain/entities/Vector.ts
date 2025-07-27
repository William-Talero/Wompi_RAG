export interface Vector {
  vector: number[];
  text: string;
  id: string;
  metadata: VectorMetadata;
}

export interface VectorMetadata {
  source?: string;
  title?: string;
  category?: string;
  [key: string]: any;
}

export interface SearchResult {
  document: Vector;
  score: number;
}
export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  vector?: number[];
}

export interface DocumentMetadata {
  title?: string;
  source?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}
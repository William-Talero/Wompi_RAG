export interface SearchRequestDTO {
  query: string;
  limit?: number;
  threshold?: number;
  category?: string;
  includeResponse?: boolean;
}

export interface SearchResultDTO {
  id: string;
  text: string;
  score: number;
  metadata: {
    title?: string;
    source?: string;
    category?: string;
    [key: string]: any;
  };
}

export interface SearchResponseDTO {
  results: SearchResultDTO[];
  query: string;
  totalResults: number;
  llmResponse?: string;
}
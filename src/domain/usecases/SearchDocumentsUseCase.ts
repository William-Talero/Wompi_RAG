import { SearchResult } from '../entities/Vector';
import { IVectorRepository } from '../repositories/IVectorRepository';
import { IEmbeddingService } from './AddDocumentUseCase';

export interface SearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
  category?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
}

export class SearchDocumentsUseCase {
  constructor(
    private vectorRepository: IVectorRepository,
    private embeddingService: IEmbeddingService
  ) {}

  async execute(request: SearchRequest): Promise<SearchResponse> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(request.query);
    
    const results = await this.vectorRepository.searchSimilar(
      queryEmbedding,
      request.limit || 10,
      request.threshold || 0.5
    );

    let filteredResults = results;
    
    if (request.category) {
      filteredResults = results.filter(
        result => result.document.metadata.category === request.category
      );
    }

    return {
      results: filteredResults,
      query: request.query,
      totalResults: filteredResults.length
    };
  }
}
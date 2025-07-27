import { Injectable } from '@nestjs/common';
import { SearchResult } from '../entities/Vector';
import { LanceVectorRepository } from '../../infrastructure/database/LanceVectorRepository';
import { OpenAIEmbeddingService } from '../../infrastructure/ai/OpenAIEmbeddingService';

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

@Injectable()
export class SearchDocumentsUseCase {
  constructor(
    private vectorRepository: LanceVectorRepository,
    private embeddingService: OpenAIEmbeddingService
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
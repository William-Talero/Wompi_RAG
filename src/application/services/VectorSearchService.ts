import { Injectable } from '@nestjs/common';
import { SearchDocumentsUseCase, SearchRequest } from '../../domain/usecases/SearchDocumentsUseCase';
import { SearchRequestDTO, SearchResponseDTO, SearchResultDTO } from '../dto/SearchResultDTO';
import { OpenAILLMService } from '../../infrastructure/ai/OpenAILLMService';

@Injectable()
export class VectorSearchService {
  constructor(
    private searchDocumentsUseCase: SearchDocumentsUseCase,
    private llmService: OpenAILLMService
  ) {}

  async search(dto: SearchRequestDTO): Promise<SearchResponseDTO> {
    try {
      const searchRequest: SearchRequest = {
        query: dto.query,
        limit: dto.limit || 10,
        threshold: dto.threshold || 0.5,
        category: dto.category
      };

      const searchResponse = await this.searchDocumentsUseCase.execute(searchRequest);

      const results: SearchResultDTO[] = searchResponse.results.map(result => ({
        id: result.document.id,
        text: result.document.text,
        score: result.score,
        metadata: result.document.metadata
      }));

      let llmResponse: string | undefined;

      if (dto.includeResponse && results.length > 0) {
        const context = results.map(r => r.text);
        const llmResult = await this.llmService.generateResponse(dto.query, context);
        llmResponse = llmResult.response;
      }

      return {
        results,
        query: dto.query,
        totalResults: results.length,
        llmResponse
      };
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
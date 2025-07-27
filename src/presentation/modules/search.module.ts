import { Module } from '@nestjs/common';
import { SearchController } from '../controllers/search.controller';
import { VectorSearchService } from '../../application/services/VectorSearchService';
import { SearchDocumentsUseCase } from '../../domain/usecases/SearchDocumentsUseCase';
import { PineconeVectorRepository } from '../../infrastructure/database/PineconeVectorRepository';
import { OpenAIEmbeddingService } from '../../infrastructure/ai/OpenAIEmbeddingService';
import { OpenAILLMService } from '../../infrastructure/ai/OpenAILLMService';

@Module({
  controllers: [SearchController],
  providers: [
    VectorSearchService,
    SearchDocumentsUseCase,
    PineconeVectorRepository,
    OpenAIEmbeddingService,
    OpenAILLMService,
  ],
})
export class SearchModule {}
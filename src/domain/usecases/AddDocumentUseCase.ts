import { Injectable } from '@nestjs/common';
import { Document } from '../entities/Document';
import { Vector } from '../entities/Vector';
import { LanceVectorRepository } from '../../infrastructure/database/LanceVectorRepository';
import { SimpleDocumentRepository } from '../../infrastructure/database/SimpleDocumentRepository';
import { OpenAIEmbeddingService } from '../../infrastructure/ai/OpenAIEmbeddingService';
import { TextProcessor } from '../../infrastructure/processors/TextProcessor';

export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
}

export interface ITextProcessor {
  processText(text: string): Promise<string[]>;
}

@Injectable()
export class AddDocumentUseCase {
  constructor(
    private vectorRepository: LanceVectorRepository,
    private documentRepository: SimpleDocumentRepository,
    private embeddingService: OpenAIEmbeddingService,
    private textProcessor: TextProcessor
  ) {}

  async execute(document: Document): Promise<void> {
    const chunks = await this.textProcessor.processText(document.content);
    
    const vectors: Vector[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.embeddingService.generateEmbedding(chunk);
      
      const vector: Vector = {
        id: `${document.id}_chunk_${i}`,
        text: chunk,
        vector: embedding,
        metadata: {
          ...document.metadata,
          source: document.metadata.source,
          chunkIndex: i,
          originalDocumentId: document.id
        }
      };
      
      vectors.push(vector);
    }

    await this.vectorRepository.addVectors(vectors);
    await this.documentRepository.save(document);
  }
}
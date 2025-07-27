import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentController } from '../controllers/document.controller';
import { DocumentService } from '../../application/services/DocumentService';
import { AddDocumentUseCase } from '../../domain/usecases/AddDocumentUseCase';
import { LanceVectorRepository } from '../../infrastructure/database/LanceVectorRepository';
import { SimpleDocumentRepository } from '../../infrastructure/database/SimpleDocumentRepository';
import { OpenAIEmbeddingService } from '../../infrastructure/ai/OpenAIEmbeddingService';
import { TextProcessor } from '../../infrastructure/processors/TextProcessor';
import { PDFProcessor } from '../../infrastructure/processors/PDFProcessor';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    AddDocumentUseCase,
    LanceVectorRepository,
    SimpleDocumentRepository,
    OpenAIEmbeddingService,
    TextProcessor,
    PDFProcessor,
  ],
})
export class DocumentModule {}
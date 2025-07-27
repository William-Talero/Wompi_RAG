import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentController } from '../controllers/document.controller';
import { DocumentService } from '../../application/services/DocumentService';
import { AddDocumentUseCase } from '../../domain/usecases/AddDocumentUseCase';
import { PineconeVectorRepository } from '../../infrastructure/database/PineconeVectorRepository';
import { SimpleDocumentRepository } from '../../infrastructure/database/SimpleDocumentRepository';
import { OpenAIEmbeddingService } from '../../infrastructure/ai/OpenAIEmbeddingService';
import { TextProcessor } from '../../infrastructure/processors/TextProcessor';
import { PDFProcessor } from '../../infrastructure/processors/PDFProcessor';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Usar almacenamiento en memoria para Vercel
      limits: {
        fileSize: 10 * 1024 * 1024, // Límite de 10MB
      },
    }),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    AddDocumentUseCase,
    PineconeVectorRepository,
    SimpleDocumentRepository,
    OpenAIEmbeddingService,
    TextProcessor,
    PDFProcessor,
  ],
})
export class DocumentModule {}
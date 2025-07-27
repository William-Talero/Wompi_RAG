import { v4 as uuidv4 } from 'uuid';
import { AddDocumentUseCase } from '../../domain/usecases/AddDocumentUseCase';
import { Document } from '../../domain/entities/Document';
import { AddDocumentDTO, AddDocumentResponse } from '../dto/AddDocumentDTO';

export class DocumentService {
  constructor(private addDocumentUseCase: AddDocumentUseCase) {}

  async addDocument(dto: AddDocumentDTO): Promise<AddDocumentResponse> {
    try {
      const document: Document = {
        id: uuidv4(),
        content: dto.content,
        metadata: {
          title: dto.title,
          source: dto.source,
          category: dto.category,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      await this.addDocumentUseCase.execute(document);

      return {
        success: true,
        documentId: document.id,
        message: 'Document added successfully'
      };
    } catch (error) {
      return {
        success: false,
        documentId: '',
        message: `Error adding document: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
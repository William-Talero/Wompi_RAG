import { Injectable } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/repositories/IDocumentRepository';
import { Document } from '../../domain/entities/Document';

@Injectable()
export class SimpleDocumentRepository implements IDocumentRepository {
  private documents: Map<string, Document> = new Map();

  async save(document: Document): Promise<void> {
    this.documents.set(document.id, document);
  }

  async findById(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  async findByMetadata(metadata: Partial<Document['metadata']>): Promise<Document[]> {
    const results: Document[] = [];
    for (const doc of this.documents.values()) {
      let matches = true;
      for (const key in metadata) {
        if (Object.prototype.hasOwnProperty.call(metadata, key)) {
          const docValue = (doc.metadata as any)[key];
          const metadataValue = (metadata as any)[key];
          if (docValue !== metadataValue) {
            matches = false;
            break;
          }
        }
      }
      if (matches) {
        results.push(doc);
      }
    }
    return results;
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id);
  }
}
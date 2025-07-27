import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ITextProcessor } from '../../domain/usecases/AddDocumentUseCase';

@Injectable()
export class TextProcessor implements ITextProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  async processText(text: string): Promise<string[]> {
    const normalizedText = this.normalizeText(text);
    const chunks = await this.textSplitter.splitText(normalizedText);
    return chunks;
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\,\?\!\:\;\-\(\)]/g, '')
      .trim();
  }
}
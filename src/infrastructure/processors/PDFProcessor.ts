import * as fs from 'fs';
import pdf from 'pdf-parse';

export class PDFProcessor {
  async extractText(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
  }
}
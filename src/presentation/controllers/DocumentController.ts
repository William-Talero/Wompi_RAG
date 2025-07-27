import { Request, Response } from 'express';
import { DocumentService } from '../../application/services/DocumentService';
import { PDFProcessor } from '../../infrastructure/processors/PDFProcessor';
import { AddDocumentDTO } from '../../application/dto/AddDocumentDTO';

export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private pdfProcessor: PDFProcessor
  ) {}

  addText = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content, title, source, category }: AddDocumentDTO = req.body;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      const result = await this.documentService.addDocument({
        content,
        title,
        source: source || 'manual',
        category: category || 'general'
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ 
        error: `Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  addPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'PDF file is required' });
        return;
      }

      const { title, category } = req.body;

      const content = await this.pdfProcessor.extractTextFromBuffer(req.file.buffer);

      const result = await this.documentService.addDocument({
        content,
        title: title || req.file.originalname,
        source: 'pdf',
        category: category || 'documents'
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      res.status(500).json({ 
        error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };
}
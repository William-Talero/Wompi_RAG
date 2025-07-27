import { Controller, Post, Body, UploadedFile, UseInterceptors, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentService } from '../../application/services/DocumentService';
import { PDFProcessor } from '../../infrastructure/processors/PDFProcessor';
import { AddDocumentDTO } from '../../application/dto/AddDocumentDTO';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private pdfProcessor: PDFProcessor
  ) {}

  @Post('text')
  @ApiOperation({ summary: 'Agregar documento de texto' })
  @ApiResponse({ status: 201, description: 'Documento agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({
    description: 'Datos del documento de texto',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Contenido del documento' },
        title: { type: 'string', description: 'Título del documento', default: 'Sin título' },
        source: { type: 'string', description: 'Fuente del documento', default: 'manual' },
        category: { type: 'string', description: 'Categoría del documento', default: 'knowledge_base' }
      },
      required: ['content']
    }
  })
  async addText(@Body() addDocumentDto: AddDocumentDTO) {
    try {
      if (!addDocumentDto.content) {
        return { error: 'Content is required', statusCode: HttpStatus.BAD_REQUEST };
      }

      const result = await this.documentService.addDocument({
        content: addDocumentDto.content,
        title: addDocumentDto.title,
        source: addDocumentDto.source || 'manual',
        category: addDocumentDto.category || 'knowledge_base'
      });

      if (result.success) {
        return { ...result, statusCode: HttpStatus.CREATED };
      } else {
        return { error: result.message, statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
      }
    } catch (error) {
      return { 
        error: `Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Post('pdf')
  @ApiOperation({ summary: 'Agregar documento PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'PDF procesado y agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo PDF requerido' })
  @ApiBody({
    description: 'Archivo PDF y metadatos',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Archivo PDF' },
        title: { type: 'string', description: 'Título del documento' },
        category: { type: 'string', description: 'Categoría del documento', default: 'knowledge_base' }
      },
      required: ['file']
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async addPDF(
    @UploadedFile() file: any,
    @Body() body: { title?: string; category?: string }
  ) {
    try {
      if (!file) {
        return { error: 'PDF file is required', statusCode: HttpStatus.BAD_REQUEST };
      }

      const content = await this.pdfProcessor.extractTextFromBuffer(file.buffer);

      const result = await this.documentService.addDocument({
        content,
        title: body.title || file.originalname,
        source: 'pdf',
        category: body.category || 'knowledge_base'
      });

      if (result.success) {
        return { ...result, statusCode: HttpStatus.CREATED };
      } else {
        return { error: result.message, statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
      }
    } catch (error) {
      return { 
        error: `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}
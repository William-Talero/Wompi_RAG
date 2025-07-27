import { Controller, Post, Body, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { VectorSearchService } from '../../application/services/VectorSearchService';
import { SearchRequestDTO } from '../../application/dto/SearchResultDTO';
import { ChatRequestDTO } from '../../application/dto/ChatDTO';
import { DataLoader } from '../../infrastructure/database/DataLoader';
import { PineconeVectorRepository } from '../../infrastructure/database/PineconeVectorRepository';
import { OpenAIEmbeddingService } from '../../infrastructure/ai/OpenAIEmbeddingService';
import { TextProcessor } from '../../infrastructure/processors/TextProcessor';

@Controller()
export class SearchController {
  constructor(private vectorSearchService: VectorSearchService) {}

  @Post('initialize')
  @ApiTags('Documents')
  @ApiOperation({ 
    summary: 'Inicializar base de datos Pinecone y cargar documentos iniciales',
    description: 'Crea el índice de Pinecone y carga automáticamente los documentos desde data/knowledge/'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Base de datos inicializada y documentos cargados correctamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        details: { type: 'string' },
        statusCode: { type: 'number' }
      }
    }
  })
  async initialize() {
    try {
      // Initialize services
      const vectorRepo = new PineconeVectorRepository();
      const embeddingService = new OpenAIEmbeddingService();
      const textProcessor = new TextProcessor();
      const dataLoader = new DataLoader(vectorRepo, embeddingService, textProcessor);
      
      // Initialize Pinecone
      console.log('🔧 Initializing Pinecone...');
      await vectorRepo.initialize();
      
      // Check if initial data already exists
      const hasData = await dataLoader.hasInitialData();
      
      if (hasData) {
        return {
          message: 'Pinecone database initialized successfully',
          details: 'Initial data already exists, skipping reload',
          statusCode: HttpStatus.OK
        };
      }
      
      // Load initial data
      console.log('📚 Loading initial knowledge base...');
      await dataLoader.loadInitialData();
      
      return {
        message: 'Pinecone database initialized successfully',
        details: 'Initial knowledge base loaded from data/knowledge/',
        statusCode: HttpStatus.OK
      };
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      return {
        error: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Post('search')
  @ApiTags('Search')
  @ApiOperation({ summary: 'Búsqueda vectorial de documentos' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  @ApiResponse({ status: 400, description: 'Query requerido' })
  @ApiBody({
    description: 'Parámetros de búsqueda',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texto a buscar' },
        limit: { type: 'number', description: 'Número máximo de resultados', default: 10 },
        threshold: { type: 'number', description: 'Umbral de similitud', default: 0.5 },
        category: { type: 'string', description: 'Categoría a filtrar', default: 'knowledge_base' },
        includeResponse: { type: 'boolean', description: 'Incluir respuesta del LLM', default: false }
      },
      required: ['query']
    }
  })
  async search(@Body() searchRequest: SearchRequestDTO) {
    try {
      if (!searchRequest.query) {
        return { error: 'Query is required', statusCode: HttpStatus.BAD_REQUEST };
      }

      const searchParams: SearchRequestDTO = {
        query: searchRequest.query,
        limit: searchRequest.limit || 10,
        threshold: searchRequest.threshold || 0.5,
        category: searchRequest.category || 'knowledge_base',
        includeResponse: searchRequest.includeResponse || false
      };

      const results = await this.vectorSearchService.search(searchParams);
      return { ...results, statusCode: HttpStatus.OK };
    } catch (error) {
      return { 
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }

  @Post('chat')
  @ApiTags('Chat')
  @ApiOperation({ 
    summary: 'Chat con respuesta contextual usando RAG',
    description: 'Realiza una consulta inteligente que busca en la base de conocimiento y genera una respuesta contextual usando IA'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta del chat con fuentes consultadas',
    schema: {
      type: 'object',
      properties: {
        response: { type: 'string', description: 'Respuesta generada por IA' },
        sources: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              source: { type: 'string' },
              score: { type: 'number' }
            }
          }
        },
        totalSources: { type: 'number' },
        statusCode: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Query requerido' })
  async chat(@Body() chatRequest: ChatRequestDTO) {
    try {
      if (!chatRequest.query) {
        return { error: 'Query is required', statusCode: HttpStatus.BAD_REQUEST };
      }

      const searchRequest: SearchRequestDTO = {
        query: chatRequest.query,
        limit: 5,
        threshold: 0.7,
        category: chatRequest.category || 'knowledge_base',
        includeResponse: true
      };

      const results = await this.vectorSearchService.search(searchRequest);
      
      return {
        response: results.llmResponse,
        sources: results.results.map(r => ({
          title: r.metadata.title,
          source: r.metadata.source,
          score: r.score
        })),
        totalSources: results.totalResults,
        statusCode: HttpStatus.OK
      };
    } catch (error) {
      return { 
        error: `Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }
  }
}
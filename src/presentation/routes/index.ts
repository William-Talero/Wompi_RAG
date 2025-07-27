import express from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/DocumentController';
import { SearchController } from '../controllers/SearchController';
import { validateAddDocument, validateSearch } from '../middlewares/validation.middleware';

import { LanceVectorRepository } from '../../infrastructure/database/LanceVectorRepository';
import { DataLoader } from '../../infrastructure/database/DataLoader';
import { OpenAIEmbeddingService } from '../../infrastructure/ai/OpenAIEmbeddingService';
import { OpenAILLMService } from '../../infrastructure/ai/OpenAILLMService';
import { TextProcessor } from '../../infrastructure/processors/TextProcessor';
import { PDFProcessor } from '../../infrastructure/processors/PDFProcessor';
import { AddDocumentUseCase } from '../../domain/usecases/AddDocumentUseCase';
import { SearchDocumentsUseCase } from '../../domain/usecases/SearchDocumentsUseCase';
import { DocumentService } from '../../application/services/DocumentService';
import { VectorSearchService } from '../../application/services/VectorSearchService';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const vectorRepository = new LanceVectorRepository();
const embeddingService = new OpenAIEmbeddingService();
const llmService = new OpenAILLMService();
const textProcessor = new TextProcessor();
const pdfProcessor = new PDFProcessor();

const addDocumentUseCase = new AddDocumentUseCase(
  vectorRepository,
  {} as any, // Simple implementation without document repository for now
  embeddingService,
  textProcessor
);

const searchDocumentsUseCase = new SearchDocumentsUseCase(
  vectorRepository,
  embeddingService
);

const dataLoader = new DataLoader(vectorRepository, embeddingService, textProcessor);

const documentService = new DocumentService(addDocumentUseCase);
const vectorSearchService = new VectorSearchService(searchDocumentsUseCase, llmService);

const documentController = new DocumentController(documentService, pdfProcessor);
const searchController = new SearchController(vectorSearchService);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servicio
 *     description: Verificar el estado del servicio RAG
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Wompi RAG Service' });
});

/**
 * @swagger
 * /initialize:
 *   post:
 *     summary: Inicializar base de datos vectorial
 *     description: Crea e inicializa la base de datos vectorial LanceDB y carga datos iniciales de Wompi
 *     tags: [Initialization]
 *     responses:
 *       200:
 *         description: Base de datos inicializada exitosamente con datos iniciales cargados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vector database initialized successfully"
 *                 initialDataLoaded:
 *                   type: boolean
 *                   example: true
 *                 totalVectors:
 *                   type: number
 *                   example: 25
 *       500:
 *         description: Error en la inicialización
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/initialize', async (req, res) => {
  try {
    // Inicializar la base de datos vectorial
    await vectorRepository.initialize();
    
    // Verificar si ya tiene datos iniciales
    const hasData = await dataLoader.hasInitialData();
    let initialDataLoaded = false;
    let totalVectors = 0;
    
    if (!hasData) {
      console.log('🔄 Loading initial Wompi knowledge base...');
      await dataLoader.loadInitialData();
      initialDataLoaded = true;
      
      // Contar vectores después de la carga
      const testVector = new Array(1536).fill(0.1);
      const results = await vectorRepository.searchSimilar(testVector, 100, 1.0);
      totalVectors = results.length;
    } else {
      console.log('ℹ️  Initial data already exists, skipping load');
    }
    
    res.json({ 
      message: 'Vector database initialized successfully',
      initialDataLoaded,
      totalVectors: hasData ? 'existing data' : totalVectors
    });
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ 
      error: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

/**
 * @swagger
 * /documents/text:
 *   post:
 *     summary: Agregar documento de texto
 *     description: Procesa y almacena un documento de texto en la base de datos vectorial
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddDocumentRequest'
 *     responses:
 *       201:
 *         description: Documento agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddDocumentResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/documents/text', validateAddDocument, documentController.addText);

/**
 * @swagger
 * /documents/pdf:
 *   post:
 *     summary: Agregar documento PDF
 *     description: Extrae texto de un PDF y lo almacena en la base de datos vectorial
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF a procesar
 *               title:
 *                 type: string
 *                 description: Título del documento (opcional)
 *               category:
 *                 type: string
 *                 description: Categoría del documento (opcional)
 *             required:
 *               - file
 *     responses:
 *       201:
 *         description: PDF procesado y agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddDocumentResponse'
 *       400:
 *         description: Error de validación o archivo no válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error procesando el PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/documents/pdf', upload.single('file'), documentController.addPDF);

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Búsqueda vectorial
 *     description: Realiza búsqueda semántica en la base de datos vectorial
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchRequest'
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error en la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/search', validateSearch, searchController.search);

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Chat con RAG
 *     description: Realiza búsqueda y genera respuesta contextual usando LLM
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 description: Pregunta del usuario
 *                 example: "¿Cómo funciona Wompi?"
 *               category:
 *                 type: string
 *                 description: Filtrar por categoría (opcional)
 *                 default: "knowledge_base"
 *                 example: "knowledge_base"
 *     responses:
 *       200:
 *         description: Respuesta del chat con fuentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error en el chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/chat', validateSearch, searchController.chat);

export { router };
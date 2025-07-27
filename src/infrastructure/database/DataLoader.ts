import * as fs from 'fs';
import * as path from 'path';
import { IVectorRepository } from '../../domain/repositories/IVectorRepository';
import { IEmbeddingService } from '../../domain/usecases/AddDocumentUseCase';
import { ITextProcessor } from '../../domain/usecases/AddDocumentUseCase';
import { Vector } from '../../domain/entities/Vector';
import { v4 as uuidv4 } from 'uuid';

export class DataLoader {
  constructor(
    private vectorRepository: IVectorRepository,
    private embeddingService: IEmbeddingService,
    private textProcessor: ITextProcessor
  ) {}

  async loadInitialData(): Promise<void> {
    try {
      // Ruta relativa desde la raíz del proyecto
      const dataPath = path.join(process.cwd(), 'data', 'knowledge');
      
      // Verificar que el directorio existe
      if (!fs.existsSync(dataPath)) {
        console.log(`📂 Data directory not found: ${dataPath}`);
        console.log('ℹ️  No initial data to load');
        return;
      }
      
      const files = fs.readdirSync(dataPath).filter(file => file.endsWith('.txt'));
      
      console.log(`📂 Found ${files.length} data files to load`);
      
      for (const file of files) {
        await this.loadFile(path.join(dataPath, file), file);
      }
      
      console.log('✅ Initial data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      throw error;
    }
  }

  private async loadFile(filePath: string, fileName: string): Promise<void> {
    try {
      console.log(`📄 Loading file: ${fileName}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const chunks = await this.textProcessor.processText(content);
      
      console.log(`📝 Processing ${chunks.length} chunks from ${fileName}`);
      
      const vectors: Vector[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.embeddingService.generateEmbedding(chunk);
        
        const vector: Vector = {
          id: `${fileName}_${uuidv4()}_chunk_${i}`,
          text: chunk,
          vector: embedding,
          metadata: {
            source: fileName,
            title: `${fileName} - Chunk ${i + 1}`,
            category: 'knowledge_base',
            chunkIndex: i,
            originalFile: fileName
          }
        };
        
        vectors.push(vector);
      }

      await this.vectorRepository.addVectors(vectors);
      console.log(`✅ Loaded ${vectors.length} vectors from ${fileName}`);
      
    } catch (error) {
      console.error(`❌ Error loading file ${fileName}:`, error);
      throw error;
    }
  }

  async hasInitialData(): Promise<boolean> {
    try {
      // Para Pinecone, verificar las estadísticas del índice
      if (this.vectorRepository instanceof (await import('./PineconeVectorRepository')).PineconeVectorRepository) {
        const stats = await (this.vectorRepository as any).getStats();
        
        if (stats && stats.totalVectorCount && stats.totalVectorCount > 0) {
          console.log(`ℹ️  Found ${stats.totalVectorCount} existing vectors in Pinecone`);
          return true;
        }
      }
      
      // Fallback: verificar si ya existe data inicial buscando vectores
      const testVector = new Array(1536).fill(0.1);
      const results = await this.vectorRepository.searchSimilar(testVector, 1, 0.0);
      
      // Si encontramos algún resultado, asumimos que ya hay data inicial
      const hasData = results.length > 0;
      
      if (hasData) {
        console.log(`ℹ️  Found ${results.length} existing documents via search`);
      } else {
        console.log('ℹ️  No existing documents found');
      }
      
      return hasData;
    } catch (error) {
      console.log('ℹ️  Error checking for initial data, assuming none exists:', error instanceof Error ? error.message : 'Unknown error');
      // Si hay error en la búsqueda, asumimos que no hay data
      return false;
    }
  }
}
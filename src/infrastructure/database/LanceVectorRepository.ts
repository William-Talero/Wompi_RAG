import { Injectable } from '@nestjs/common';
import { connect, Table } from 'vectordb';
import { IVectorRepository } from '../../domain/repositories/IVectorRepository';
import { Vector, SearchResult } from '../../domain/entities/Vector';
import { config } from '../../shared/config/environment';

@Injectable()
export class LanceVectorRepository implements IVectorRepository {
  private table: Table | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      const db = await connect(config.vectors.path);
      
      try {
        this.table = await db.openTable(config.vectors.tableName);
        console.log(`✅ Opened existing table: ${config.vectors.tableName}`);
      } catch {
        console.log(`📝 Creating new table: ${config.vectors.tableName}`);
        
        const sampleData = [{
          vector: new Array(config.vectors.embeddingDimension).fill(0.0),
          text: 'sample_text',
          id: 'sample_id',
          source: 'initialization',
          title: 'Sample Document',
          category: 'test'
        }];
        
        this.table = await db.createTable(config.vectors.tableName, sampleData);
        await this.table.delete('id = "sample_id"');
        console.log(`✅ Created and cleaned table: ${config.vectors.tableName}`);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('LanceDB initialization error:', error);
      throw new Error(`Failed to initialize vector database: ${error}`);
    }
  }

  async addVector(vector: Vector): Promise<void> {
    if (!this.isInitialized || !this.table) {
      await this.initialize();
    }

    const data = [{
      vector: vector.vector,
      text: vector.text,
      id: vector.id,
      source: vector.metadata.source || 'unknown',
      title: vector.metadata.title || 'Untitled',
      category: vector.metadata.category || 'general'
    }];

    await this.table!.add(data);
  }

  async addVectors(vectors: Vector[]): Promise<void> {
    if (!this.isInitialized || !this.table) {
      await this.initialize();
    }

    const data = vectors.map(vector => ({
      vector: vector.vector,
      text: vector.text,
      id: vector.id,
      source: vector.metadata.source || 'unknown',
      title: vector.metadata.title || 'Untitled',
      category: vector.metadata.category || 'general'
    }));

    await this.table!.add(data);
  }

  async searchSimilar(queryVector: number[], limit: number = 10, threshold: number = 0.5): Promise<SearchResult[]> {
    if (!this.isInitialized || !this.table) {
      await this.initialize();
    }

    const results = await this.table!
      .search(queryVector)
      .limit(limit)
      .execute();

    // En LanceDB, menor distancia = mayor similitud
    // El campo score contiene la distancia/similitud
    const filteredResults = results.filter((result: any) => {
      const distance = result.score || result._distance || result.distance || 0;
      return distance <= threshold;
    });
    
    return filteredResults
      .map((result: any) => ({
        document: {
          id: result.id,
          text: result.text,
          vector: result.vector,
          metadata: {
            source: result.source,
            title: result.title,
            category: result.category
          }
        },
        score: result.score || result._distance || result.distance || 0
      }));
  }

  async deleteVector(id: string): Promise<void> {
    if (!this.isInitialized || !this.table) {
      await this.initialize();
    }

    await this.table!.delete(`id = "${id}"`);
  }

  async vectorExists(id: string): Promise<boolean> {
    if (!this.isInitialized || !this.table) {
      await this.initialize();
    }

    const results = await this.table!
      .search([])
      .where(`id = "${id}"`)
      .limit(1)
      .execute();

    return results.length > 0;
  }
}
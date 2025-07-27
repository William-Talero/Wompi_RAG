import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { IVectorRepository } from '../../domain/repositories/IVectorRepository';
import { Vector, SearchResult } from '../../domain/entities/Vector';
import { config } from '../../shared/config/environment';

@Injectable()
export class PineconeVectorRepository implements IVectorRepository {
  private pinecone: Pinecone;
  private indexName = 'wompi-documents';
  private isInitialized = false;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some((index: any) => index.name === this.indexName);

      if (!indexExists) {
        // Create index if it doesn't exist
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: config.vectors.embeddingDimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });

        // Wait for index to be ready
        console.log('Waiting for Pinecone index to be ready...');
        await this.waitForIndexReady();
      }

      this.isInitialized = true;
      console.log('✅ Pinecone initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Pinecone:', error);
      throw error;
    }
  }

  private async waitForIndexReady(): Promise<void> {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const indexDescription = await this.pinecone.describeIndex(this.indexName);
        if (indexDescription.status?.ready) {
          return;
        }
      } catch (error) {
        // Index might not be ready yet
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
    }

    throw new Error('Pinecone index failed to become ready within timeout');
  }

  async addVector(vector: Vector): Promise<void> {
    await this.addVectors([vector]);
  }

  async addVectors(vectors: Vector[]): Promise<void> {
    await this.initialize();

    try {
      const index = this.pinecone.Index(this.indexName);
      
      // Transform vectors to Pinecone format
      const pineconeVectors = vectors.map(vector => ({
        id: vector.id,
        values: vector.vector,
        metadata: {
          text: vector.text,
          title: vector.metadata.title || '',
          source: vector.metadata.source || '',
          category: vector.metadata.category || '',
          chunkIndex: vector.metadata.chunkIndex || 0,
          originalDocumentId: vector.metadata.originalDocumentId || '',
          createdAt: vector.metadata.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: vector.metadata.updatedAt?.toISOString() || new Date().toISOString()
        }
      }));

      // Upsert vectors in batches of 100 (Pinecone limit)
      const batchSize = 100;
      for (let i = 0; i < pineconeVectors.length; i += batchSize) {
        const batch = pineconeVectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }

      console.log(`✅ Added ${vectors.length} vectors to Pinecone`);
    } catch (error) {
      console.error('❌ Failed to add vectors to Pinecone:', error);
      throw error;
    }
  }

  async searchSimilar(queryVector: number[], limit: number = 10, threshold: number = 0.5): Promise<SearchResult[]> {
    await this.initialize();

    try {
      const index = this.pinecone.Index(this.indexName);
      
      const queryResponse = await index.query({
        vector: queryVector,
        topK: limit,
        includeMetadata: true,
        includeValues: false
      });

      const results: SearchResult[] = [];

      if (queryResponse.matches) {
        for (const match of queryResponse.matches) {
          // Convert Pinecone score to distance (Pinecone uses cosine similarity 0-1, we want distance)
          const distance = 1 - (match.score || 0);
          
          if (distance <= (1 - threshold)) { // Apply threshold
            const metadata = match.metadata as any;
            
            results.push({
              document: {
                id: match.id || '',
                text: metadata?.text || '',
                vector: [], // Pinecone no retorna valores por defecto para optimizar
                metadata: {
                  title: metadata?.title || '',
                  source: metadata?.source || '',
                  category: metadata?.category || '',
                  chunkIndex: metadata?.chunkIndex || 0,
                  originalDocumentId: metadata?.originalDocumentId || '',
                  createdAt: metadata?.createdAt ? new Date(metadata.createdAt) : new Date(),
                  updatedAt: metadata?.updatedAt ? new Date(metadata.updatedAt) : new Date()
                }
              },
              score: distance
            });
          }
        }
      }

      console.log(`🔍 Found ${results.length} similar vectors in Pinecone`);
      return results;
    } catch (error) {
      console.error('❌ Failed to search vectors in Pinecone:', error);
      throw error;
    }
  }

  async vectorExists(id: string): Promise<boolean> {
    await this.initialize();

    try {
      const index = this.pinecone.Index(this.indexName);
      const response = await index.fetch([id]);
      return response.records && Object.keys(response.records).length > 0;
    } catch (error) {
      console.error('❌ Failed to check vector existence in Pinecone:', error);
      return false;
    }
  }

  async deleteVector(id: string): Promise<void> {
    await this.initialize();

    try {
      const index = this.pinecone.Index(this.indexName);
      await index.deleteOne(id);
      console.log(`🗑️ Deleted vector ${id} from Pinecone`);
    } catch (error) {
      console.error('❌ Failed to delete vector from Pinecone:', error);
      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    await this.initialize();

    try {
      const index = this.pinecone.Index(this.indexName);
      await index.deleteAll();
      console.log('🗑️ Deleted all vectors from Pinecone');
    } catch (error) {
      console.error('❌ Failed to delete all vectors from Pinecone:', error);
      throw error;
    }
  }

  async getStats(): Promise<any> {
    await this.initialize();

    try {
      const index = this.pinecone.Index(this.indexName);
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('❌ Failed to get Pinecone stats:', error);
      return null;
    }
  }
}
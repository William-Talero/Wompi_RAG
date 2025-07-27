import { Vector, SearchResult } from '../entities/Vector';

export interface IVectorRepository {
  initialize(): Promise<void>;
  addVector(vector: Vector): Promise<void>;
  addVectors(vectors: Vector[]): Promise<void>;
  searchSimilar(queryVector: number[], limit?: number, threshold?: number): Promise<SearchResult[]>;
  deleteVector(id: string): Promise<void>;
  vectorExists(id: string): Promise<boolean>;
}
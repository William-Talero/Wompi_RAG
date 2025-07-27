import { Request, Response } from 'express';
import { VectorSearchService } from '../../application/services/VectorSearchService';
import { SearchRequestDTO } from '../../application/dto/SearchResultDTO';

export class SearchController {
  constructor(private vectorSearchService: VectorSearchService) {}

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        query, 
        limit, 
        threshold, 
        category, 
        includeResponse 
      }: SearchRequestDTO = req.body;

      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }

      const searchRequest: SearchRequestDTO = {
        query,
        limit: limit || 10,
        threshold: threshold || 0.5,
        category,
        includeResponse: includeResponse || false
      };

      const results = await this.vectorSearchService.search(searchRequest);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ 
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  chat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, category }: SearchRequestDTO = req.body;

      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }

      const searchRequest: SearchRequestDTO = {
        query,
        limit: 5,
        threshold: 0.7,
        category,
        includeResponse: true
      };

      const results = await this.vectorSearchService.search(searchRequest);
      
      res.status(200).json({
        response: results.llmResponse,
        sources: results.results.map(r => ({
          title: r.metadata.title,
          source: r.metadata.source,
          score: r.score
        })),
        totalSources: results.totalResults
      });
    } catch (error) {
      res.status(500).json({ 
        error: `Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };
}
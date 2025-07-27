import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchRequestDTO {
  @ApiProperty({ 
    description: 'Texto a buscar en la base de conocimiento',
    example: 'métodos de pago disponibles'
  })
  @IsString()
  query!: string;

  @ApiProperty({ 
    description: 'Número máximo de resultados a retornar', 
    required: false, 
    default: 10,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ 
    description: 'Umbral de similitud (0-1, donde 1 es coincidencia exacta)', 
    required: false, 
    default: 0.5,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiProperty({ 
    description: 'Categoría de documentos a filtrar', 
    required: false, 
    default: 'knowledge_base',
    example: 'knowledge_base'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    description: 'Si incluir respuesta generada por IA además de los resultados de búsqueda', 
    required: false, 
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  includeResponse?: boolean;
}

export interface SearchResultDTO {
  id: string;
  text: string;
  score: number;
  metadata: {
    title?: string;
    source?: string;
    category?: string;
    [key: string]: any;
  };
}

export interface SearchResponseDTO {
  results: SearchResultDTO[];
  query: string;
  totalResults: number;
  llmResponse?: string;
}
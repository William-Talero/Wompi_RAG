import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDTO {
  @ApiProperty({ 
    description: 'Pregunta o consulta para el chat',
    example: '¿Cómo funciona el sistema de pagos de Wompi?'
  })
  @IsString()
  query!: string;

  @ApiProperty({ 
    description: 'Categoría de documentos a consultar', 
    required: false, 
    default: 'knowledge_base',
    example: 'knowledge_base'
  })
  @IsOptional()
  @IsString()
  category?: string;
}

export interface ChatResponseDTO {
  response: string;
  sources: Array<{
    title: string;
    source: string;
    score: number;
  }>;
  totalSources: number;
  statusCode: number;
}
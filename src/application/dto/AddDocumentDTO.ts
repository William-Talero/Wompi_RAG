import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddDocumentDTO {
  @ApiProperty({ 
    description: 'Contenido del documento a agregar a la base de conocimiento',
    example: 'Wompi es una plataforma de pagos que permite procesar transacciones de forma segura...'
  })
  @IsString()
  content!: string;

  @ApiProperty({ 
    description: 'Título descriptivo del documento', 
    required: false, 
    default: 'Sin título',
    example: 'Información general sobre Wompi'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ 
    description: 'Fuente de origen del documento', 
    required: false, 
    default: 'manual',
    example: 'manual'
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ 
    description: 'Categoría para clasificar el documento', 
    required: false, 
    default: 'knowledge_base',
    example: 'knowledge_base'
  })
  @IsOptional()
  @IsString()
  category?: string;
}

export interface AddDocumentResponse {
  success: boolean;
  documentId: string;
  message: string;
}
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

const createNestApp = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors({ origin: '*' });
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe());
    
    // API prefix
    app.setGlobalPrefix('api/v1');
    
    // Swagger configuration
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Wompi RAG API')
      .setDescription('API para el sistema RAG de Wompi con LanceDB')
      .setVersion('1.0')
      .addTag('System', 'Endpoints del sistema y salud')
      .addTag('Documents', 'Gestión de documentos y base de conocimiento')
      .addTag('Search', 'Búsqueda vectorial de documentos')
      .addTag('Chat', 'Chat inteligente con respuestas contextuales')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);
    
    await app.init();
  }
  return app;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  const nestApp = await createNestApp();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};
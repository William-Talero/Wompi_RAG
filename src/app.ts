import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router } from './presentation/routes';
import { errorHandler } from './middlewares/error.middleware';
import { config } from './shared/config/environment';
import { setupSwagger } from './shared/config/swagger';

const app: Application = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

setupSwagger(app);

app.use('/api/v1', router);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 Wompi RAG Service running on port ${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/api/v1/health`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
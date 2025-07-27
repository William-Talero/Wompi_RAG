import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || 'pcsk_4FYX8A_G4wEnLYtcdHcyQpcmymg6U1ppSpwVsKmK4fiXLe6g1p3LZWei8w4TzZbJnF7wWv',
  },
  vectors: {
    path: './vectors',
    embeddingDimension: 1536,
    tableName: 'wompi_documents'
  }
};
import { QdrantClient } from '@qdrant/js-client-rest';

if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
  throw new Error('Please set QDRANT_URL and QDRANT_API_KEY environment variables.');
}

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTION_NAME: string = 'RAG_system_collection';
export const EMBEDDING_MODEL: string = 'nomic-embed-text';
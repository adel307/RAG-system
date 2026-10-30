import { QdrantClient } from '@qdrant/js-client-rest';
import { COLLECTION_NAME_ENV, QDRANT_API_KEY_ENV, QDRANT_URL_ENV } from '../config/env.js';
import { Point } from '../types/index.js';

if (!QDRANT_URL_ENV || !QDRANT_API_KEY_ENV) {
  throw new Error('Please set QDRANT_URL and QDRANT_API_KEY environment variables.');
}

export const qdrantClient = new QdrantClient({
  url: QDRANT_URL_ENV,
  apiKey: QDRANT_API_KEY_ENV,
});

export async function ensureCollectionExists(): Promise<void> {
  const collections = await qdrantClient.getCollections();
  const collectionExists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME_ENV
  );

  if (!collectionExists) { 
    await qdrantClient.createCollection(COLLECTION_NAME_ENV, {
      vectors: {
        size: 768,
        distance: 'Cosine',
      },
    });
    console.log(`The collection '${COLLECTION_NAME_ENV}' has been created successfully.`);
  }
}

export async function upsertPoints(points: Point[]): Promise<any> {
  return await qdrantClient.upsert(COLLECTION_NAME_ENV, {
    wait: true,
    points
  });
}
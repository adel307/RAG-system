import { qdrantClient, COLLECTION_NAME } from '../config/env.js';
import type { Point } from '../types/types/index.js';

export async function ensureCollectionExists(): Promise<void> {
  const collections = await qdrantClient.getCollections();
  const collectionExists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

  if (!collectionExists) { 
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 768,
        distance: 'Cosine',
      },
    });
    console.log(`The collection '${COLLECTION_NAME}' has been created successfully.`);
  }
}

export async function upsertPoints(points: Point[]): Promise<any> {
  return await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points: points,
  });
}
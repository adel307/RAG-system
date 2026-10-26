import { generateEmbedding } from '../services/ollama.service.js';
import { ensureCollectionExists, upsertPoints } from '../services/qdrant.service.js';
import type { Item, Point } from '../types/types/index.js';

const items: Item[] = [
  {
    id: 1,
    text: 'An article about artificial intelligence',
    payload: {
      title: 'An article about artificial intelligence',
      category: 'tech',
      author: 'ahmed',
    },
  },
  {
    id: 2,
    text: 'Vector Database Fundamentals',
    payload: {
      title: 'Vector Database Fundamentals',
      category: 'database',
      author: 'sara',
    },
  },
];

export async function setupAndUpload(): Promise<void> {
  try {
    await ensureCollectionExists();

    const points: Point[] = [];

    for (const item of items) {
      const embedding = await generateEmbedding(item.text);
      if (!embedding) continue;

      points.push({
        id: item.id,
        vector: embedding,
        payload: item.payload,
      });
    }

    const result = await upsertPoints(points);
    console.log('Data uploaded successfully:', result);
  } catch (error) {
    console.error('An error occurred during connection or upload:', error);
  }
}

setupAndUpload();
import { QdrantClient } from '@qdrant/js-client-rest';
import ollama from 'ollama';

if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY || !process.env.OPENAI_API_KEY) {
  throw new Error('Please set the QDRANT_URL environment variable in the .env file.');
}

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'RAG_system_collection';
const EMBEDDING_MODEL = 'nomic-embed-text';

export async function setupAndUpload() {
  try {
    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (c) => c.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 768, // حجم المتجهات (يُحدد حسب نموذج الـ Embedding المستخدم، مثلاً nomic-embed-text)
          distance: 'Cosine', // طريقة حساب التشابه: Cosine, Euclid, أو Dot
        },
      });
      console.log(`The collection '${COLLECTION_NAME}' has been created successfully.`);
    }

    const items = [
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

    const points = [];

    for (const item of items) {
        const response = await ollama.embeddings({
            model: EMBEDDING_MODEL,
            prompt: item.text,
        });

        const embedding = response.embedding;
        if (!embedding) continue;

        points.push({
            id: item.id,
            vector: embedding, // مصفوفة صحيحة بطول 768
            payload: item.payload,
        });
    }

    const result = await client.upsert(COLLECTION_NAME, {
        wait: true,
        points: points,
    });

    console.log('Data uploaded successfully:', result);
  } catch (error) {
    console.error('An error occurred during connection or upload:', error);
  }
}
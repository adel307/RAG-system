import ollama from 'ollama';
import { EMBEDDING_MODEL } from '../config/env.js';

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const response = await ollama.embeddings({
    model: EMBEDDING_MODEL,
    prompt: text,
  });

  return response.embedding || null;
}
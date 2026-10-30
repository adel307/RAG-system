import ollama from 'ollama';
import { OLLAMA_MODEL_ENV } from '../config/env';

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const response = await ollama.embeddings({
    model: OLLAMA_MODEL_ENV,
    prompt: text,
  });

  return response.embedding || null;
}
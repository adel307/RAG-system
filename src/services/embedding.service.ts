import { OLLAMA_MODEL_ENV, OLLAMA_URL_ENV  } from "../config/env";

const ollamaUrl =
  OLLAMA_URL_ENV ?? "http://localhost:11434/api/embeddings";
const ollamaModel = OLLAMA_MODEL_ENV ?? "nomic-embed-text";

interface OllamaEmbeddingResponse {
  embedding?: unknown;
}

export async function createEmbedding(text: string): Promise<number[]> {
  if (!text || typeof text !== "string") {
    throw new Error('Input must be a valid non-empty string.');
  }

  const ollamaResponse = await fetch(ollamaUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: ollamaModel, prompt: text }),
  });

  if (!ollamaResponse.ok) {
    const details = await ollamaResponse.text();
    throw new Error(`Ollama returned HTTP ${ollamaResponse.status}: ${details}`);
  }

  const result = (await ollamaResponse.json()) as OllamaEmbeddingResponse;
  
  if (
    !Array.isArray(result.embedding) ||
    !result.embedding.every((value): value is number => typeof value === "number")
  ) {
    throw new Error("Ollama returned an invalid embedding response.");
  }

  return result.embedding;
}
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  COLLECTION_NAME: z.string().min(1, 'COLLECTION_NAME is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1, 'GEMINI_MODEL is required'),
  QDRANT_API_KEY: z.string().min(1, 'QDRANT_API_KEY is required'),
  QDRANT_URL: z.string().url('QDRANT_URL must be a valid URL'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  OLLAMA_URL: z.string().min(1, 'OLLAMA_URL is required').url('OLLAMA_URL must be a valid URL'),
  EMBEDDING_MODEL: z.string().min(1, 'EMBEDDING_MODEL is required'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables detected:');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  process.exit(1); // إيقاف السيرفر فوراً لو في أي خطأ
}

const env = parseResult.data;

export const COLLECTION_NAME_ENV: string = env.COLLECTION_NAME;
export const GEMINI_API_KEY_ENV: string = env.GEMINI_API_KEY;
export const GEMINI_MODEL_ENV: string = env.GEMINI_MODEL;
export const QDRANT_API_KEY_ENV: string = env.QDRANT_API_KEY;
export const QDRANT_URL_ENV: string = env.QDRANT_URL;
export const OPENAI_API_KEY_ENV: string = env.OPENAI_API_KEY || '';
export const MONGODB_URI_ENV: string = env.MONGODB_URI;
export const PORT_ENV: string = env.PORT;
export const NODE_ENV: string = env.NODE_ENV;
export const FRONTEND_URL_ENV: string = env.FRONTEND_URL;
export const JWT_SECRET_ENV: string = env.JWT_SECRET;
export const OLLAMA_URL_ENV: string = env.OLLAMA_URL || '';
export const EMBEDDING_MODEL_ENV: string = env.EMBEDDING_MODEL || '';
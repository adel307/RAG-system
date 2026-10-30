import PDFParser from 'pdf2json';
import crypto from 'crypto';
import type { Point } from '../types/index.js';
import { createEmbedding } from "../services/embedding.service.js";

export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (err: any) => {
      reject(err.parserError || err);
    });

    pdfParser.on("pdfParser_dataReady", () => {
      try {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.parseBuffer(pdfBuffer);
  });
}

/**
 * تنظيف النص وتقسيمه إلى Chunks ذكية تحترم حدود الكلمات والجمل
 */
export function splitTextIntoChunks(
  text: string, 
  targetChunkSize = 1000, 
  chunkOverlap = 200
): string[] {
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];

  let startIndex = 0;
  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + targetChunkSize;

    if (endIndex >= cleanedText.length) {
      chunks.push(cleanedText.substring(startIndex).trim());
      break;
    }

    let breakIndex = cleanedText.lastIndexOf(' ', endIndex);
    if (breakIndex <= startIndex) {
      breakIndex = endIndex;
    }

    const chunk = cleanedText.substring(startIndex, breakIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = breakIndex - chunkOverlap;
    if (startIndex < 0) startIndex = 0;
  }

  return chunks;
}

/**
 * توليد الـ Embeddings والنقاط (Points) على شكل دفعات (Batches)
 */
export async function generatePointsForChunks(
  chunks: string[],
  originalName: string,
  batchSize = 5
): Promise<Point[]> {
  const points: Point[] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batchChunks = chunks.slice(i, i + batchSize);

    const batchPromises = batchChunks.map(async (chunkText, batchIndex) => {
      const globalIndex = i + batchIndex;
      let vector: number[];
      
      try {
        vector = await createEmbedding(chunkText);
      } catch (embedError) {
        throw new Error(`Embedding service failed for chunk ${globalIndex}: ${embedError instanceof Error ? embedError.message : String(embedError)}`);
      }

      if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error(`Failed to generate a valid embedding vector for chunk ${globalIndex}.`);
      }

      return {
        id: crypto.randomUUID(),
        vector,
        payload: {
          filename: originalName,
          chunkIndex: globalIndex,
          text: chunkText,
        },
      };
    });

    const batchResults = await Promise.all(batchPromises);
    points.push(...batchResults);

    console.log(`Processed batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(chunks.length / batchSize)}`);
  }

  return points;
}
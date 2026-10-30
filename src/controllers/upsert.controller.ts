import type { Request, Response } from "express";
import { ensureCollectionExists, upsertPoints } from "../services/qdrant.service.js";
import { extractPdfText, splitTextIntoChunks, generatePointsForChunks } from "../helpers/pdf.helper.js";

export async function upsertToDatabase(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // 1. التحقق من وجود الملف
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No PDF file provided.' });
      return;
    }

    const pdfBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // 2. استخراج النص من الـ PDF
    const fullText = await extractPdfText(pdfBuffer);

    if (!fullText || fullText.trim().length === 0) {
      res.status(400).json({ success: false, error: 'The uploaded PDF is empty or text could not be extracted.' });
      return;
    }

    // 3. تنظيف وتقسيم النص إلى Chunks
    const chunks = splitTextIntoChunks(fullText);

    // 4. التأكد من أن الـ Collection موجودة في Qdrant
    await ensureCollectionExists();

    // 5 & 6. توليد الـ Embeddings والنقاط على دفعات
    const points = await generatePointsForChunks(chunks, originalName);

    // 7. رفع جميع النقاط دفعة واحدة إلى Qdrant
    const result = await upsertPoints(points);

    // 8. الرد بالنجاح
    res.status(201).json({
      success: true,
      message: 'PDF chunks successfully processed and upserted.',
      totalChunks: chunks.length,
      status: result?.status ?? 'completed',
    });

  } catch (error) {
    console.error('An error occurred during PDF processing or upload:', error);
    res.status(500).json({
      error: 'Internal server error while processing PDF.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
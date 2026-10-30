import { type Request, type Response } from 'express';

const GEMINI_MODEL:string = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

interface ChatRequestBody {
  role:string;
  content: string;
}

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content: GeminiContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

export async function createChatResponse(req:Request<{}, {}, ChatRequestBody>, res:Response) {
  const content = req.body.content;

  if (typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({
      error: 'The content field must be a non-empty string.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'The chat service is not configured.',
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: content }] }],
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      console.error(`Gemini request failed with status ${response.status}.`);
      return res.status(502).json({ error: 'The AI service could not process the request.' });
    }

    const result = (await response.json()) as GeminiResponse;
    const aiContent = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter((text): text is string => typeof text === 'string')
      .join('');

    if (!aiContent) {
      console.error('Gemini returned no text content.');
      return res.status(502).json({ error: 'The AI service returned an empty response.' });
    }

    return res.json({ content: aiContent });
  } catch (error:any) {
    console.error('Chat request failed:', error);

    if (error?.name === 'TimeoutError') {
      return res.status(504).json({ error: 'The AI service request timed out.' });
    }

    return res.status(502).json({ error: 'The AI service is unavailable.' });
  }
}
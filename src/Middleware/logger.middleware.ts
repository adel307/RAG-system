import type { Request, Response, NextFunction } from 'express';
import { Log } from '../models/log.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // نستخدم حدث 'finish' لضمان أن الاستجابة تمت وأصبح لدينا الـ status والوقت المستغرق
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;

      // حماية البيانات الحساسة في الـ Body (مثل إخفاء كلمات المرور)
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) {
        sanitizedBody.password = '********';
      }

      // حفظ الـ Log في قاعدة البيانات
      await Log.create({
        ip: req.ip || req.socket.remoteAddress || '',
        headers: req.headers,
        method: req.method,
        url: req.originalUrl || req.url,
        params: req.params,
        queryParams: req.query,
        body: Object.keys(sanitizedBody).length > 0 ? sanitizedBody : undefined,
        responseTime,
        status: res.statusCode,
        userAgent: req.get('user-agent'),
        // يمكن جلب رسالة الخطأ إذا تم تخزينها مسبقاً في res.locals بواسطة الـ Error Middleware
        errorMessage: res.locals.errorMessage || undefined,
      });
    } catch (error) {
      console.error('❌ Failed to save request log to database:', error);
    }
  });

  next();
};
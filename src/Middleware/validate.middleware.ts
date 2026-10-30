import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny, ZodError } from 'zod';

export const validate = (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // التحقق من الـ body, params, query حسب ما هو معرف في الـ Schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // تنسيق الأخطاء لتكون واضحة للعميل (Client)
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          status: 'fail',
          errors: errorMessages,
        });
        return;
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }
  };
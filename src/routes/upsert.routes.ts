import { Router } from 'express';
import { upsertToDatabase } from '../controllers/upsert.controller.js';
import { uploadPdfMiddleware } from '../Middleware/uploadPdfMiddleware.js';

const router = Router();

router.post('/upsert',uploadPdfMiddleware, upsertToDatabase);

export default router;
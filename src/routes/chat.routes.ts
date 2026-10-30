import { Router } from 'express';
import { createChatResponse } from '../controllers/chat.controller.js';

const router = Router();

router.post('/', createChatResponse);

export default router;

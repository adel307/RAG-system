import { Router } from 'express';
import { createChatResponse } from '../controllers/chatController.js';

const router = Router();

router.post('/chat', createChatResponse);

export default router;

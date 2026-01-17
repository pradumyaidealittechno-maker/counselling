import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { aiService } from '../services/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/ai/chat
 * Chat with AI assistant about hiring, DNA matching, candidates
 */
router.post(
  '/chat',
  [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('context').optional().isObject(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { message, context } = req.body;

      console.log('💬 AI Chat request:', { message, hasContext: !!context });

      const response = await aiService.chatAssistant(message, context);

      res.json({ response });
    } catch (error: any) {
      console.error('AI Chat error:', error);
      res.status(500).json({ error: error.message || 'Failed to get AI response' });
    }
  }
);

export default router;

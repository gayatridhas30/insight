import { Router } from 'express';
import {
  runEventAnalysis,
  getEventAnalysis,
  queryRAGAssistant,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/events/:eventId/analyze', runEventAnalysis);
router.get('/events/:eventId/analysis', getEventAnalysis);
router.post('/rag/query', queryRAGAssistant);

export default router;

import { Router } from 'express';
import {
  getFormByEventId,
  updateFormSettings,
  saveQuestions,
  generateAIQuestions,
} from '../controllers/formController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public route to view form questions for submission
router.get('/event/:eventId/public', getFormByEventId);

// Protected organizer routes
router.use(protect);

router.get('/event/:eventId', getFormByEventId);
router.put('/event/:eventId/settings', updateFormSettings);
router.put('/event/:eventId/questions', saveQuestions);
router.post('/event/:eventId/ai-generate', generateAIQuestions);

export default router;

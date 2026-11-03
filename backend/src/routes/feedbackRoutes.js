import { Router } from 'express';
import {
  submitFeedback,
  getResponsesByEvent,
  getResponseById,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public feedback submission (no login required for attendees)
router.post('/submit', submitFeedback);

// Protected routes for organizers to view responses
router.get('/event/:eventId', protect, getResponsesByEvent);
router.get('/:id', protect, getResponseById);

export default router;

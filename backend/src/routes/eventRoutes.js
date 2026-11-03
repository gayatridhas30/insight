import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getEventByCode,
  updateEvent,
  deleteEvent,
  createSession,
  compareEvents,
} from '../controllers/eventController.js';
import { protect, requireOrgRole } from '../middleware/auth.js';

const router = Router();

// Public route for participants to lookup event info by code
router.get('/code/:code', getEventByCode);

// Authenticated organizer routes
router.use(protect);

router.get('/', getEvents);
router.post('/', createEvent);
router.post('/compare', compareEvents);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/sessions', createSession);

export default router;

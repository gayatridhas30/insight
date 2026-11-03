import { Router } from 'express';
import {
  getIntegrationStatus,
  translateText,
  transcribeAudio,
} from '../controllers/bhashiniController.js';

const router = Router();

// Bhashini status, translation, and ASR are accessible for participants and hosts
router.get('/status', getIntegrationStatus);
router.post('/translate', translateText);
router.post('/transcribe', transcribeAudio);

export default router;

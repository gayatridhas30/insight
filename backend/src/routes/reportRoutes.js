import { Router } from 'express';
import { exportExcel, exportPDF } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/events/:eventId/excel', exportExcel);
router.get('/events/:eventId/pdf', exportPDF);

export default router;

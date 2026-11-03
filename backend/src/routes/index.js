import { Router } from 'express';
import authRoutes from './authRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import eventRoutes from './eventRoutes.js';
import formRoutes from './formRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import aiRoutes from './aiRoutes.js';
import improvementTaskRoutes from './improvementTaskRoutes.js';
import adminRoutes from './adminRoutes.js';
import bhashiniRoutes from './bhashiniRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/events', eventRoutes);
router.use('/forms', formRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/ai', aiRoutes);
router.use('/tasks', improvementTaskRoutes);
router.use('/admin', adminRoutes);
router.use('/bhashini', bhashiniRoutes);
router.use('/reports', reportRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'InsightLoop Express API Gateway',
  });
});

export default router;

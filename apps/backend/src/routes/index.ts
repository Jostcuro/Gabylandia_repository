import { Router } from 'express';
import { dashboardRouter } from './dashboard.routes.js';
import { eventsRouter } from './events.routes.js';
import { templatesRouter } from './templates.routes.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend' });
});

router.use('/events', eventsRouter);
router.use('/templates', templatesRouter);
router.use('/dashboard', dashboardRouter);

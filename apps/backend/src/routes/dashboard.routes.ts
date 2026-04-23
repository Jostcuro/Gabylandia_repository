import { Router } from 'express';
import { dashboardController } from '../modules/dashboard/dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', dashboardController.stats);
dashboardRouter.get('/availability', dashboardController.availability);

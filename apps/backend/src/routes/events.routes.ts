import { Router } from 'express';
import { eventController } from '../modules/events/event.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/', eventController.list);
eventsRouter.post('/', eventController.create);
eventsRouter.post('/:eventId/checklist-items', eventController.createChecklistItem);
eventsRouter.patch('/checklist-items/:itemId', eventController.updateChecklistItem);
eventsRouter.get('/:eventId/whatsapp-summary', eventController.whatsappSummary);

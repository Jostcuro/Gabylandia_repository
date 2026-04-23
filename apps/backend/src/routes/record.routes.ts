import { Router } from 'express';
import { recordController } from '../modules/records/record.controller.js';

export const recordRouter = Router();

recordRouter.get('/', recordController.getAll);
recordRouter.post('/', recordController.create);
recordRouter.patch('/:id', recordController.update);
recordRouter.delete('/:id', recordController.remove);

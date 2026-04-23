import { Router } from 'express';
import { templateController } from '../modules/templates/template.controller.js';

export const templatesRouter = Router();

templatesRouter.get('/', templateController.list);
templatesRouter.post('/', templateController.create);

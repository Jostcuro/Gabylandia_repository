import { ChecklistCategory } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { templateRepository } from './template.repository.js';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(
    z.object({
      label: z.string().min(1),
      category: z.nativeEnum(ChecklistCategory)
    })
  )
});

export const templateController = {
  async list(_req: Request, res: Response) {
    const templates = await templateRepository.findAll();
    res.json(templates);
  },

  async create(req: Request, res: Response) {
    const payload = createTemplateSchema.parse(req.body);
    const created = await templateRepository.create(payload.name, payload.description, payload.items);
    res.status(201).json(created);
  }
};

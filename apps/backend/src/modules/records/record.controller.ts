import { Request, Response } from 'express';
import { z } from 'zod';
import { recordService } from './record.service.js';

const createRecordSchema = z.object({
  title: z.string().min(1),
  amount: z.number().finite()
});

const updateRecordSchema = z
  .object({
    title: z.string().min(1).optional(),
    amount: z.number().finite().optional()
  })
  .refine((body) => body.title !== undefined || body.amount !== undefined, {
    message: 'At least one field is required'
  });

export const recordController = {
  async getAll(_req: Request, res: Response) {
    const records = await recordService.getAll();
    res.json(records);
  },

  async create(req: Request, res: Response) {
    const parsed = createRecordSchema.parse(req.body);
    const created = await recordService.create(parsed);
    res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const id = z.coerce.number().parse(req.params.id);
    const parsed = updateRecordSchema.parse(req.body);
    const updated = await recordService.update(id, parsed);
    res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const id = z.coerce.number().parse(req.params.id);
    const deleted = await recordService.remove(id);
    res.json(deleted);
  }
};

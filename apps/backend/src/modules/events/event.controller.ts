import { ChecklistCategory, ChecklistStatus, EventStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { eventService } from './event.service.js';

const createEventSchema = z.object({
  bookingDate: z.string(),
  eventDateTime: z.string(),
  address: z.string().min(5),
  status: z.nativeEnum(EventStatus),
  contactName: z.string().min(1),
  contactPhone: z.string().min(7),
  honoreeName: z.string().min(1),
  honoreeAge: z.number().int().min(0).optional(),
  theme: z.string().min(1),
  setupDescription: z.string().min(1),
  imageUrls: z.array(z.string().url()).max(3),
  price: z.number().nonnegative(),
  advancePayment: z.number().nonnegative(),
  logisticsNotes: z.string().optional(),
  checklistItems: z
    .array(
      z.object({
        label: z.string().min(1),
        category: z.nativeEnum(ChecklistCategory),
        status: z.nativeEnum(ChecklistStatus).optional()
      })
    )
    .optional()
});

const updateChecklistItemSchema = z
  .object({
    status: z.nativeEnum(ChecklistStatus).optional(),
    isChecked: z.boolean().optional()
  })
  .refine((value) => value.status !== undefined || value.isChecked !== undefined);

export const eventController = {
  async list(_req: Request, res: Response) {
    const data = await eventService.getAll();
    res.json(data);
  },

  async create(req: Request, res: Response) {
    const payload = createEventSchema.parse(req.body);
    const created = await eventService.create(payload);
    res.status(201).json(created);
  },

  async updateChecklistItem(req: Request, res: Response) {
    const itemId = z.coerce.number().parse(req.params.itemId);
    const payload = updateChecklistItemSchema.parse(req.body);
    const updated = await eventService.updateChecklistItem(itemId, payload);
    res.json(updated);
  },

  async createChecklistItem(req: Request, res: Response) {
    const eventId = z.coerce.number().parse(req.params.eventId);
    const body = z.object({ label: z.string().min(1), category: z.nativeEnum(ChecklistCategory) }).parse(req.body);
    const created = await eventService.createChecklistItem(eventId, body.label, body.category);
    res.status(201).json(created);
  },

  async whatsappSummary(req: Request, res: Response) {
    const eventId = z.coerce.number().parse(req.params.eventId);
    const summary = await eventService.buildWhatsappSummary(eventId);
    res.json(summary);
  }
};

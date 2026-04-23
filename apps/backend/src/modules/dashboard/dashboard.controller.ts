import { prisma } from '../../db/prisma.js';
import { Request, Response } from 'express';
import { z } from 'zod';

export const dashboardController = {
  async stats(_req: Request, res: Response) {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const [totalEvents, currentMonthEvents, financials, pendingItems] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { eventDateTime: { gte: monthStart, lt: nextMonthStart } } }),
      prisma.event.aggregate({ _sum: { price: true } }),
      prisma.checklistItem.count({ where: { status: { not: 'READY' } } })
    ]);

    res.json({
      totalEvents,
      currentMonthEvents,
      totalIncome: Number(financials._sum.price ?? 0),
      pendingItems
    });
  },

  async availability(req: Request, res: Response) {
    const date = z.string().parse(req.query.date);
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    const events = await prisma.event.count({ where: { eventDateTime: { gte: start, lte: end }, status: { not: 'CANCELED' } } });

    res.json({ date, status: events > 0 ? 'OCCUPIED' : 'FREE' });
  }
};

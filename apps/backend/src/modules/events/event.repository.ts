import { Prisma, ChecklistStatus } from '@prisma/client';
import { prisma } from '../../db/prisma.js';
import { CreateEventInput, UpdateChecklistItemInput } from './event.types.js';

export const eventRepository = {
  findAll() {
    return prisma.event.findMany({
      orderBy: { eventDateTime: 'asc' },
      include: { checklistItems: true }
    });
  },

  findById(id: number) {
    return prisma.event.findUnique({ where: { id }, include: { checklistItems: true } });
  },

  create(data: CreateEventInput) {
    const balanceDue = data.price - data.advancePayment;
    return prisma.event.create({
      data: {
        bookingDate: new Date(data.bookingDate),
        eventDateTime: new Date(data.eventDateTime),
        address: data.address,
        status: data.status,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        honoreeName: data.honoreeName,
        honoreeAge: data.honoreeAge,
        theme: data.theme,
        setupDescription: data.setupDescription,
        imageUrls: data.imageUrls,
        price: new Prisma.Decimal(data.price),
        advancePayment: new Prisma.Decimal(data.advancePayment),
        balanceDue: new Prisma.Decimal(balanceDue),
        logisticsNotes: data.logisticsNotes ?? '',
        checklistItems: data.checklistItems
          ? {
              createMany: {
                data: data.checklistItems.map((item) => ({
                  label: item.label,
                  category: item.category,
                  status: item.status ?? ChecklistStatus.MISSING
                }))
              }
            }
          : undefined
      },
      include: { checklistItems: true }
    });
  },

  updateChecklistItem(itemId: number, data: UpdateChecklistItemInput) {
    return prisma.checklistItem.update({
      where: { id: itemId },
      data,
      include: { event: true }
    });
  },

  createChecklistItem(eventId: number, label: string, category: Prisma.ChecklistCategory) {
    return prisma.checklistItem.create({
      data: {
        eventId,
        label,
        category
      }
    });
  }
};

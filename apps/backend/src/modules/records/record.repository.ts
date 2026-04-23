import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';
import { CreateRecordInput, UpdateRecordInput } from './record.types.js';

export const recordRepository = {
  findAll() {
    return prisma.record.findMany({ orderBy: { createdAt: 'desc' } });
  },

  create(data: CreateRecordInput) {
    return prisma.record.create({
      data: {
        title: data.title,
        amount: new Prisma.Decimal(data.amount)
      }
    });
  },

  update(id: number, data: UpdateRecordInput) {
    return prisma.record.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(typeof data.amount === 'number' ? { amount: new Prisma.Decimal(data.amount) } : {})
      }
    });
  },

  delete(id: number) {
    return prisma.record.delete({ where: { id } });
  }
};

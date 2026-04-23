import { ChecklistCategory } from '@prisma/client';
import { prisma } from '../../db/prisma.js';

export const templateRepository = {
  findAll() {
    return prisma.template.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  },

  create(name: string, description: string | undefined, items: Array<{ label: string; category: ChecklistCategory }>) {
    return prisma.template.create({
      data: {
        name,
        description,
        items: {
          createMany: {
            data: items
          }
        }
      },
      include: { items: true }
    });
  }
};

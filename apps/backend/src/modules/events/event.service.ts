import { ChecklistCategory, ChecklistStatus } from '@prisma/client';
import { appendBackupRow } from '../../services/googleSheetsBackup.js';
import { eventRepository } from './event.repository.js';
import { CreateEventInput, UpdateChecklistItemInput } from './event.types.js';

const mapEvent = <T extends { price: { toString(): string }; advancePayment: { toString(): string }; balanceDue: { toString(): string } }>(
  event: T
) => ({
  ...event,
  price: Number(event.price.toString()),
  advancePayment: Number(event.advancePayment.toString()),
  balanceDue: Number(event.balanceDue.toString())
});

export const eventService = {
  async getAll() {
    const events = await eventRepository.findAll();
    return events.map(mapEvent);
  },

  async create(data: CreateEventInput) {
    const created = await eventRepository.create(data);
    await appendBackupRow({
      action: 'CREATE',
      entity: 'EVENT',
      entityId: created.id,
      payload: JSON.stringify({
        theme: created.theme,
        status: created.status,
        balanceDue: created.balanceDue.toString()
      })
    });
    return mapEvent(created);
  },

  async updateChecklistItem(itemId: number, data: UpdateChecklistItemInput) {
    const updated = await eventRepository.updateChecklistItem(itemId, data);
    await appendBackupRow({
      action: 'UPDATE',
      entity: 'CHECKLIST_ITEM',
      entityId: updated.id,
      payload: JSON.stringify({
        eventId: updated.eventId,
        status: updated.status,
        isChecked: updated.isChecked
      })
    });
    return updated;
  },

  async createChecklistItem(eventId: number, label: string, category: ChecklistCategory) {
    const created = await eventRepository.createChecklistItem(eventId, label, category);
    await appendBackupRow({
      action: 'CREATE',
      entity: 'CHECKLIST_ITEM',
      entityId: created.id,
      payload: JSON.stringify({
        eventId: created.eventId,
        label: created.label,
        category: created.category
      })
    });
    return created;
  },

  async buildWhatsappSummary(eventId: number) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const pending = event.checklistItems.filter((item) => item.status !== ChecklistStatus.READY);

    const message = [
      `*Gabylandia - Pendientes*`,
      `Evento: ${event.theme} (${event.honoreeName})`,
      `Fecha: ${event.eventDateTime.toISOString()}`,
      '',
      ...pending.map((item) => `- [${item.status}] ${item.label}`)
    ].join('\n');

    return {
      message,
      url: `https://wa.me/?text=${encodeURIComponent(message)}`
    };
  }
};

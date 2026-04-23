import { appendBackupRow } from '../../services/googleSheetsBackup.js';
import { recordRepository } from './record.repository.js';
import { CreateRecordInput, UpdateRecordInput } from './record.types.js';

export const recordService = {
  async getAll() {
    const records = await recordRepository.findAll();
    return records.map((record) => ({
      ...record,
      amount: Number(record.amount)
    }));
  },

  async create(input: CreateRecordInput) {
    const created = await recordRepository.create(input);

    await appendBackupRow({
      action: 'CREATE',
      recordId: created.id,
      title: created.title,
      amount: created.amount.toString(),
      happenedAt: new Date().toISOString()
    });

    return {
      ...created,
      amount: Number(created.amount)
    };
  },

  async update(id: number, input: UpdateRecordInput) {
    const updated = await recordRepository.update(id, input);

    await appendBackupRow({
      action: 'UPDATE',
      recordId: updated.id,
      title: updated.title,
      amount: updated.amount.toString(),
      happenedAt: new Date().toISOString()
    });

    return {
      ...updated,
      amount: Number(updated.amount)
    };
  },

  async remove(id: number) {
    const deleted = await recordRepository.delete(id);

    await appendBackupRow({
      action: 'DELETE',
      recordId: deleted.id,
      title: deleted.title,
      amount: deleted.amount.toString(),
      happenedAt: new Date().toISOString()
    });

    return {
      ...deleted,
      amount: Number(deleted.amount)
    };
  }
};

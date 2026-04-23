import { ChecklistCategory, ChecklistStatus, EventStatus } from '@prisma/client';

export interface ChecklistItemInput {
  label: string;
  category: ChecklistCategory;
  status?: ChecklistStatus;
}

export interface CreateEventInput {
  bookingDate: string;
  eventDateTime: string;
  address: string;
  status: EventStatus;
  contactName: string;
  contactPhone: string;
  honoreeName: string;
  honoreeAge?: number;
  theme: string;
  setupDescription: string;
  imageUrls: string[];
  price: number;
  advancePayment: number;
  logisticsNotes?: string;
  checklistItems?: ChecklistItemInput[];
}

export interface UpdateChecklistItemInput {
  status?: ChecklistStatus;
  isChecked?: boolean;
}

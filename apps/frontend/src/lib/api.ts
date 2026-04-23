import axios from 'axios';

export type EventStatus = 'CONFIRMED' | 'PENDING' | 'QUOTE' | 'CANCELED';
export type ChecklistCategory = 'FIXED' | 'PER_EVENT' | 'FABRICATION' | 'CONSUMABLE' | 'ADDITIONAL';
export type ChecklistStatus = 'MISSING' | 'IN_PROGRESS' | 'READY';

export interface ChecklistItem {
  id: number;
  eventId: number;
  label: string;
  category: ChecklistCategory;
  status: ChecklistStatus;
  isChecked: boolean;
}

export interface EventItem {
  id: number;
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
  balanceDue: number;
  logisticsNotes: string;
  checklistItems: ChecklistItem[];
}

export interface TemplateItem {
  id: number;
  name: string;
  description?: string;
  items: Array<{ id: number; label: string; category: ChecklistCategory }>;
}

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: API_URL });

export const eventsApi = {
  async list() {
    const { data } = await api.get<EventItem[]>('/events');
    return data;
  },
  async create(payload: Omit<EventItem, 'id' | 'balanceDue' | 'checklistItems'> & { checklistItems: Array<{ label: string; category: ChecklistCategory }> }) {
    const { data } = await api.post<EventItem>('/events', payload);
    return data;
  },
  async addChecklistItem(eventId: number, payload: { label: string; category: ChecklistCategory }) {
    const { data } = await api.post<ChecklistItem>(`/events/${eventId}/checklist-items`, payload);
    return data;
  },
  async updateChecklistItem(itemId: number, payload: Partial<Pick<ChecklistItem, 'status' | 'isChecked'>>) {
    const { data } = await api.patch<ChecklistItem>(`/events/checklist-items/${itemId}`, payload);
    return data;
  },
  async whatsappSummary(eventId: number) {
    const { data } = await api.get<{ message: string; url: string }>(`/events/${eventId}/whatsapp-summary`);
    return data;
  }
};

export const templateApi = {
  async list() {
    const { data } = await api.get<TemplateItem[]>('/templates');
    return data;
  },
  async create(payload: { name: string; description?: string; items: Array<{ label: string; category: ChecklistCategory }> }) {
    const { data } = await api.post<TemplateItem>('/templates', payload);
    return data;
  }
};

export const dashboardApi = {
  async stats() {
    const { data } = await api.get<{ totalEvents: number; currentMonthEvents: number; totalIncome: number; pendingItems: number }>(
      '/dashboard/stats'
    );
    return data;
  },
  async availability(date: string) {
    const { data } = await api.get<{ date: string; status: 'FREE' | 'OCCUPIED' }>('/dashboard/availability', { params: { date } });
    return data;
  }
};

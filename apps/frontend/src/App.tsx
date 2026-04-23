import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ChecklistCategory,
  ChecklistStatus,
  EventItem,
  EventStatus,
  dashboardApi,
  eventsApi,
  templateApi,
  TemplateItem
} from './lib/api';

const statusLabel: Record<EventStatus, string> = {
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendiente',
  QUOTE: 'Cotización',
  CANCELED: 'Cancelado'
};

const checklistStatusLabel: Record<ChecklistStatus, string> = {
  MISSING: 'Falta',
  IN_PROGRESS: 'En proceso',
  READY: 'Listo'
};

const categoryLabel: Record<ChecklistCategory, string> = {
  FIXED: 'Fijos',
  PER_EVENT: 'Por evento',
  FABRICATION: 'Taller / Producción',
  CONSUMABLE: 'Consumibles',
  ADDITIONAL: 'Adicionales'
};

const LOCAL_CACHE_KEY = 'gabylandia_events_cache_v2';

const defaultForm = {
  bookingDate: '',
  eventDateTime: '',
  address: '',
  status: 'PENDING' as EventStatus,
  contactName: '',
  contactPhone: '',
  honoreeName: '',
  honoreeAge: '',
  theme: '',
  setupDescription: '',
  image1: '',
  image2: '',
  image3: '',
  price: 0,
  advancePayment: 0,
  logisticsNotes: '',
  templateId: ''
};

export function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState<string>('');
  const [form, setForm] = useState(defaultForm);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', itemLabel: '', itemCategory: 'FABRICATION' as ChecklistCategory });
  const [templateItemsDraft, setTemplateItemsDraft] = useState<Array<{ label: string; category: ChecklistCategory }>>([]);
  const [newChecklistItem, setNewChecklistItem] = useState({ label: '', category: 'FABRICATION' as ChecklistCategory });
  const [error, setError] = useState<string | null>(null);

  const selectedEvent = useMemo(() => events.find((item) => item.id === selectedEventId) ?? null, [events, selectedEventId]);

  const localStats = useMemo(() => {
    const total = events.length;
    const month = new Date().getMonth();
    const monthEvents = events.filter((event) => new Date(event.eventDateTime).getMonth() === month).length;
    const income = events.reduce((acc, event) => acc + event.price, 0);
    const pending = events.reduce(
      (acc, event) => acc + event.checklistItems.filter((item) => item.status !== 'READY').length,
      0
    );
    return { totalEvents: total, currentMonthEvents: monthEvents, totalIncome: income, pendingItems: pending };
  }, [events]);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    try {
      const [eventsResponse, templatesResponse] = await Promise.all([eventsApi.list(), templateApi.list()]);
      setEvents(eventsResponse);
      setTemplates(templatesResponse);
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(eventsResponse));
      if (!selectedEventId && eventsResponse[0]) setSelectedEventId(eventsResponse[0].id);
      setError(null);
    } catch {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        setEvents(JSON.parse(cached) as EventItem[]);
        setError('Sin conexión al servidor: mostrando datos locales del navegador.');
      } else {
        setError('No se pudo cargar la información.');
      }
    }
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedTemplate = templates.find((template) => String(template.id) === form.templateId);
    const checklistFromTemplate = selectedTemplate?.items.map((item) => ({ label: item.label, category: item.category })) ?? [];
    const imageUrls = [form.image1, form.image2, form.image3].filter(Boolean);

    const payload = {
      bookingDate: form.bookingDate,
      eventDateTime: form.eventDateTime,
      address: form.address,
      status: form.status,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      honoreeName: form.honoreeName,
      honoreeAge: form.honoreeAge ? Number(form.honoreeAge) : undefined,
      theme: form.theme,
      setupDescription: form.setupDescription,
      imageUrls,
      price: Number(form.price),
      advancePayment: Number(form.advancePayment),
      logisticsNotes: form.logisticsNotes,
      checklistItems: checklistFromTemplate
    };

    await eventsApi.create(payload as any);
    setForm(defaultForm);
    await loadAll();
  }

  async function handleToggleChecklist(itemId: number, status: ChecklistStatus) {
    await eventsApi.updateChecklistItem(itemId, { status, isChecked: status === 'READY' });
    await loadAll();
  }

  async function handleAddChecklistItem() {
    if (!selectedEventId || !newChecklistItem.label) return;
    await eventsApi.addChecklistItem(selectedEventId, newChecklistItem);
    setNewChecklistItem({ label: '', category: 'FABRICATION' });
    await loadAll();
  }

  async function handleCreateTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!templateForm.name || templateItemsDraft.length === 0) return;
    await templateApi.create({
      name: templateForm.name,
      description: templateForm.description,
      items: templateItemsDraft
    });
    setTemplateForm({ name: '', description: '', itemLabel: '', itemCategory: 'FABRICATION' });
    setTemplateItemsDraft([]);
    await loadAll();
  }

  async function handleAvailabilityCheck() {
    if (!availabilityDate) return;
    const result = await dashboardApi.availability(availabilityDate);
    setAvailabilityResult(result.status === 'FREE' ? 'Libre' : 'Ocupado');
  }

  async function handleWhatsappSummary() {
    if (!selectedEventId) return;
    const summary = await eventsApi.whatsappSummary(selectedEventId);
    window.open(summary.url, '_blank');
  }

  const progress = selectedEvent
    ? Math.round(
        (selectedEvent.checklistItems.filter((item) => item.status === 'READY').length /
          Math.max(selectedEvent.checklistItems.length, 1)) *
          100
      )
    : 0;

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-8 text-brand-text">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="rounded-2xl border border-brand-gold/30 bg-brand-card p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-brand-gold">Gabylandia · Gestión Operativa</h1>
          <p className="mt-2 text-brand-soft">Agenda, checklist, dashboard, finanzas y respaldo operativo.</p>
        </header>

        {error && <div className="rounded-lg bg-red-900/50 p-3 text-sm">{error}</div>}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total eventos" value={localStats.totalEvents} />
          <StatCard title="Eventos del mes" value={localStats.currentMonthEvents} />
          <StatCard title="Ingresos" value={`$${localStats.totalIncome.toLocaleString()}`} />
          <StatCard title="Ítems faltantes" value={localStats.pendingItems} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={handleCreateEvent} className="grid gap-3 rounded-2xl border border-brand-gold/20 bg-brand-card p-5">
            <h2 className="text-xl font-semibold text-brand-gold">Nuevo Evento</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Fecha de reserva" type="date" value={form.bookingDate} onChange={(v) => setForm({ ...form, bookingDate: v })} />
              <Input label="Fecha/Hora del evento" type="datetime-local" value={form.eventDateTime} onChange={(v) => setForm({ ...form, eventDateTime: v })} />
              <Input label="Dirección" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <Select label="Estado" value={form.status} onChange={(v) => setForm({ ...form, status: v as EventStatus })} options={Object.entries(statusLabel)} />
              <Input label="Contacto" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
              <Input label="Teléfono" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
              <Input label="Festejado" value={form.honoreeName} onChange={(v) => setForm({ ...form, honoreeName: v })} />
              <Input label="Edad" type="number" value={form.honoreeAge} onChange={(v) => setForm({ ...form, honoreeAge: v })} />
              <Input label="Temática" value={form.theme} onChange={(v) => setForm({ ...form, theme: v })} />
              <Input label="Precio" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} />
              <Input label="Abono inicial" type="number" value={String(form.advancePayment)} onChange={(v) => setForm({ ...form, advancePayment: Number(v) })} />
              <Select
                label="Plantilla"
                value={form.templateId}
                onChange={(v) => setForm({ ...form, templateId: v })}
                options={[["", 'Sin plantilla'], ...templates.map((t) => [String(t.id), t.name])]}
              />
            </div>
            <TextArea label="Descripción del montaje" value={form.setupDescription} onChange={(v) => setForm({ ...form, setupDescription: v })} />
            <TextArea label="Notas de logística" value={form.logisticsNotes} onChange={(v) => setForm({ ...form, logisticsNotes: v })} />
            <div className="grid gap-2 md:grid-cols-3">
              <Input label="Imagen URL 1" value={form.image1} onChange={(v) => setForm({ ...form, image1: v })} />
              <Input label="Imagen URL 2" value={form.image2} onChange={(v) => setForm({ ...form, image2: v })} />
              <Input label="Imagen URL 3" value={form.image3} onChange={(v) => setForm({ ...form, image3: v })} />
            </div>
            <button className="rounded-lg bg-brand-gold px-4 py-2 font-semibold text-brand-bg">Guardar evento</button>
          </form>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-brand-gold/20 bg-brand-card p-4">
              <h3 className="font-semibold">Disponibilidad rápida</h3>
              <div className="mt-2 flex gap-2">
                <input type="date" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} className="w-full rounded border border-brand-soft/40 bg-transparent px-2 py-1" />
                <button onClick={handleAvailabilityCheck} className="rounded bg-brand-gold px-3 text-brand-bg">Ver</button>
              </div>
              {availabilityResult && <p className="mt-2 text-sm">Resultado: <strong>{availabilityResult}</strong></p>}
            </div>

            <form onSubmit={handleCreateTemplate} className="rounded-2xl border border-brand-gold/20 bg-brand-card p-4">
              <h3 className="font-semibold">Plantillas de checklist</h3>
              <Input label="Nombre" value={templateForm.name} onChange={(v) => setTemplateForm({ ...templateForm, name: v })} />
              <Input label="Descripción" value={templateForm.description} onChange={(v) => setTemplateForm({ ...templateForm, description: v })} />
              <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2">
                <input
                  value={templateForm.itemLabel}
                  onChange={(e) => setTemplateForm({ ...templateForm, itemLabel: e.target.value })}
                  placeholder="Ítem"
                  className="rounded border border-brand-soft/40 bg-transparent px-2 py-1"
                />
                <select
                  value={templateForm.itemCategory}
                  onChange={(e) => setTemplateForm({ ...templateForm, itemCategory: e.target.value as ChecklistCategory })}
                  className="rounded border border-brand-soft/40 bg-transparent px-2 py-1"
                >
                  {Object.entries(categoryLabel).map(([key, value]) => (
                    <option key={key} value={key} className="text-black">{value}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!templateForm.itemLabel) return;
                    setTemplateItemsDraft([...templateItemsDraft, { label: templateForm.itemLabel, category: templateForm.itemCategory }]);
                    setTemplateForm({ ...templateForm, itemLabel: '' });
                  }}
                  className="rounded bg-brand-rose px-3"
                >
                  +
                </button>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {templateItemsDraft.map((item, index) => <li key={`${item.label}-${index}`}>• {item.label} ({categoryLabel[item.category]})</li>)}
              </ul>
              <button className="mt-3 rounded bg-brand-gold px-3 py-1 text-brand-bg">Guardar plantilla</button>
            </form>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-3 rounded-2xl border border-brand-gold/20 bg-brand-card p-4">
            <h3 className="font-semibold">Agenda de eventos</h3>
            {events.map((item) => {
              const eventProgress = Math.round((item.checklistItems.filter((x) => x.status === 'READY').length / Math.max(item.checklistItems.length, 1)) * 100);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedEventId(item.id)}
                  className={`w-full rounded-lg border p-3 text-left ${selectedEventId === item.id ? 'border-brand-gold' : 'border-brand-soft/20'}`}
                >
                  <p className="font-semibold">{item.theme} · {item.honoreeName}</p>
                  <p className="text-xs text-brand-soft">{new Date(item.eventDateTime).toLocaleString()}</p>
                  <div className="mt-2 h-2 rounded bg-brand-soft/20">
                    <div style={{ width: `${eventProgress}%` }} className="h-full rounded bg-brand-gold" />
                  </div>
                  <p className="mt-2 text-sm">
                    {item.balanceDue > 0 ? `🔴 Pendiente: $${item.balanceDue.toLocaleString()}` : '🟢 Pagado'}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-brand-gold/20 bg-brand-card p-4">
            {selectedEvent ? (
              <>
                <h3 className="text-xl font-semibold text-brand-gold">{selectedEvent.theme} · {selectedEvent.honoreeName}</h3>
                <p className="text-sm text-brand-soft">{selectedEvent.address} · {statusLabel[selectedEvent.status]}</p>
                <p className="mt-2 text-sm">Notas de logística: {selectedEvent.logisticsNotes || 'Sin notas'}</p>
                <div className="mt-3 h-3 rounded bg-brand-soft/20"><div className="h-full rounded bg-brand-gold" style={{ width: `${progress}%` }} /></div>
                <p className="mt-1 text-sm">Progreso checklist: {progress}%</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <input
                    placeholder="Nuevo pendiente"
                    value={newChecklistItem.label}
                    onChange={(e) => setNewChecklistItem({ ...newChecklistItem, label: e.target.value })}
                    className="min-w-[240px] flex-1 rounded border border-brand-soft/40 bg-transparent px-2 py-1"
                  />
                  <select
                    value={newChecklistItem.category}
                    onChange={(e) => setNewChecklistItem({ ...newChecklistItem, category: e.target.value as ChecklistCategory })}
                    className="rounded border border-brand-soft/40 bg-transparent px-2 py-1"
                  >
                    {Object.entries(categoryLabel).map(([key, value]) => (
                      <option key={key} value={key} className="text-black">{value}</option>
                    ))}
                  </select>
                  <button onClick={handleAddChecklistItem} className="rounded bg-brand-rose px-3">Agregar</button>
                  <button onClick={handleWhatsappSummary} className="rounded bg-green-600 px-3">WhatsApp resumen</button>
                </div>

                <div className="mt-4 space-y-3">
                  {Object.entries(categoryLabel).map(([categoryKey, categoryName]) => (
                    <div key={categoryKey}>
                      <p className="mb-1 text-sm font-semibold text-brand-gold">{categoryName}</p>
                      <div className="space-y-1">
                        {selectedEvent.checklistItems
                          .filter((item) => item.category === categoryKey)
                          .map((item) => (
                            <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded border border-brand-soft/20 px-2 py-1">
                              <span>{item.label}</span>
                              <select
                                value={item.status}
                                onChange={(e) => void handleToggleChecklist(item.id, e.target.value as ChecklistStatus)}
                                className="rounded border border-brand-soft/40 bg-transparent px-2 py-1 text-xs"
                              >
                                {Object.entries(checklistStatusLabel).map(([key, value]) => (
                                  <option key={key} value={key} className="text-black">{value}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Selecciona un evento para ver su detalle operativo.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-brand-gold/20 bg-brand-card p-4 text-center">
      <p className="text-xs uppercase tracking-widest text-brand-soft">{title}</p>
      <p className="mt-2 text-2xl font-bold text-brand-gold">{value}</p>
    </article>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="rounded border border-brand-soft/40 bg-transparent px-2 py-1" required={type !== 'number'} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded border border-brand-soft/40 bg-transparent px-2 py-1">
        {options.map(([key, val]) => (
          <option key={key} value={key} className="text-black">{val}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-20 rounded border border-brand-soft/40 bg-transparent px-2 py-1" />
    </label>
  );
}

import { FormEvent, useState } from 'react';

interface RecordFormProps {
  onSubmit: (payload: { title: string; amount: number }) => Promise<void>;
}

export function RecordForm({ onSubmit }: RecordFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, amount });
      setTitle('');
      setAmount(0);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl bg-brand-card p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-brand-text">Nuevo registro</h2>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Concepto"
        className="rounded-md border border-brand-muted/30 bg-transparent px-3 py-2"
        required
      />
      <input
        value={amount}
        type="number"
        step="0.01"
        onChange={(event) => setAmount(Number(event.target.value))}
        placeholder="Monto"
        className="rounded-md border border-brand-muted/30 bg-transparent px-3 py-2"
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-brand-primary px-3 py-2 font-semibold text-brand-bg transition hover:opacity-90 disabled:opacity-70"
      >
        {submitting ? 'Guardando...' : 'Guardar registro'}
      </button>
    </form>
  );
}

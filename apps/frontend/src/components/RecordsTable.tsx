import { RecordItem } from '../lib/api';

interface RecordsTableProps {
  records: RecordItem[];
}

export function RecordsTable({ records }: RecordsTableProps) {
  return (
    <section className="rounded-xl bg-brand-card p-4 shadow-lg">
      <h2 className="mb-3 text-lg font-semibold">Registros globales</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-brand-muted">
              <th className="px-2 py-1">ID</th>
              <th className="px-2 py-1">Concepto</th>
              <th className="px-2 py-1">Monto</th>
              <th className="px-2 py-1">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t border-brand-muted/20">
                <td className="px-2 py-2">{record.id}</td>
                <td className="px-2 py-2">{record.title}</td>
                <td className="px-2 py-2">${record.amount.toFixed(2)}</td>
                <td className="px-2 py-2">{new Date(record.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

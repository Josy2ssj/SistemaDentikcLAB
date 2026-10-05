import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Order } from '../types';
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Plus, Circle, Triangle, Square, Diamond, Star, FileText } from 'lucide-react';
import OrderModal from '../components/OrderModal';
import OrderDetail from '../components/OrderDetail';

const treatmentTypes = ['Alineadores', 'Retenedores', 'Modelos', 'Guías quirúrgicas', 'Guardas', 'Otros'];
const statusFilters = ['Todas', 'Pendientes', 'En proceso', 'Listas', 'Entregadas', 'Atrasadas'];

const statusColors: Record<string, string> = {
  'Pendiente': 'bg-pastel-yellow text-amber-700',
  'En proceso': 'bg-pastel-blue text-blue-700',
  'Lista': 'bg-pastel-mint text-emerald-700',
  'Entregada': 'bg-gray-100 text-gray-600',
  'Atrasada': 'bg-pastel-coral text-red-700',
};

function getEffectiveStatus(order: Order): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const reqDate = parseISO(order.requestedDate); reqDate.setHours(0, 0, 0, 0);
  if (order.status !== 'Entregada' && isBefore(reqDate, today)) return 'Atrasada';
  return order.status;
}

function getIcon(type: string) {
  const s = 13;
  switch (type) {
    case 'Alineadores': return <Circle size={s} strokeWidth={1.5} />;
    case 'Retenedores': return <Triangle size={s} strokeWidth={1.5} />;
    case 'Modelos': return <Square size={s} strokeWidth={1.5} />;
    case 'Guías quirúrgicas': return <Diamond size={s} strokeWidth={1.5} />;
    case 'Guardas': return <Star size={s} strokeWidth={1.5} />;
    default: return <FileText size={s} strokeWidth={1.5} />;
  }
}

export default function Orders() {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...state.orders];

    // Status filter
    if (statusFilter !== 'Todas') {
      result = result.filter(o => {
        const eff = getEffectiveStatus(o);
        if (statusFilter === 'Pendientes') return o.status === 'Pendiente';
        if (statusFilter === 'En proceso') return o.status === 'En proceso';
        if (statusFilter === 'Listas') return o.status === 'Lista';
        if (statusFilter === 'Entregadas') return o.status === 'Entregada';
        if (statusFilter === 'Atrasadas') return eff === 'Atrasada';
        return true;
      });
    }

    // Type filter
    if (typeFilter) {
      result = result.filter(o => o.treatmentType === typeFilter);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.patientName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.clinic.toLowerCase().includes(q) ||
        o.doctor.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.orders, statusFilter, typeFilter, search]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-[20px] font-semibold text-navy">Órdenes</h1>
        <p className="text-[13px] text-slate-text mt-0.5">{state.orders.length} órdenes en total</p>
      </div>

      {/* Filters */}
      <div className="px-8 pb-3 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`pill text-[12px] ${statusFilter === s ? 'pill-active' : 'pill-inactive'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {treatmentTypes.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`pill text-[11px] flex items-center gap-1 ${typeFilter === t ? 'pill-active' : 'pill-inactive'}`}
            >
              {getIcon(t)} {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-[280px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text" />
            <input
              className="input-field pl-8 h-[34px] text-[12px]"
              placeholder="Buscar paciente, ID, clínica..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1" />
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Nueva orden
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                {['ID', 'Paciente', 'Tratamiento', 'Arcada', 'Clínica', 'Doctor', 'Fecha', 'Estado'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-slate-text px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const effStatus = getEffectiveStatus(order);
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="border-b border-black/3 hover:bg-black/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 text-[12px] font-medium text-slate-text">{order.id}</td>
                    <td className="px-4 py-2.5 text-[13px] font-medium text-navy">{order.patientName}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-[12px] text-navy">
                        {getIcon(order.treatmentType)} {order.treatmentType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-text">{order.arch}</td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-text">{order.clinic}</td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-text">{order.doctor}</td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-text">
                      {format(parseISO(order.requestedDate), 'd MMM', { locale: es })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`pill text-[10px] px-2 py-0.5 ${statusColors[effStatus]}`}>
                        {effStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-slate-text">
                    No se encontraron órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <OrderModal onClose={() => setShowModal(false)} />}
      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

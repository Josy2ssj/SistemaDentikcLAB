import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Order } from '../types';
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Edit2, Trash2, Clock, User, Building, Stethoscope } from 'lucide-react';
import OrderModal from './OrderModal';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  'Pendiente': 'bg-pastel-yellow text-amber-700',
  'En proceso': 'bg-pastel-blue text-blue-700',
  'Lista': 'bg-pastel-mint text-emerald-700',
  'Entregada': 'bg-gray-100 text-gray-600',
};

function getEffectiveStatus(order: Order): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reqDate = parseISO(order.requestedDate);
  reqDate.setHours(0, 0, 0, 0);
  if (order.status !== 'Entregada' && isBefore(reqDate, today)) return 'Atrasada';
  return order.status;
}

export default function OrderDetail({ order, onClose }: OrderDetailProps) {
  const { updateOrder, deleteOrder } = useApp();
  const [editing, setEditing] = useState(false);
  const effectiveStatus = getEffectiveStatus(order);

  const handleStatusChange = (newStatus: string) => {
    updateOrder({ ...order, status: newStatus as Order['status'] });
  };

  const handleDelete = () => {
    if (confirm('¿Eliminar esta orden?')) {
      deleteOrder(order.id);
      onClose();
    }
  };

  if (editing) {
    return <OrderModal order={order} onClose={() => { setEditing(false); onClose(); }} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-[480px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-text">{order.id}</div>
              <h2 className="text-[18px] font-semibold text-navy mt-0.5">{order.patientName}</h2>
            </div>
            <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 mt-3">
            <span className={`pill text-[11px] ${
              effectiveStatus === 'Atrasada' ? 'bg-pastel-coral text-red-700' : statusColors[order.status]
            }`}>
              {effectiveStatus}
            </span>
            <span className="text-[12px] text-slate-text">{order.treatmentType} · {order.arch}</span>
          </div>
        </div>

        {/* Info grid */}
        <div className="px-5 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="card-sm px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-text mb-0.5">
                <Building size={12} /> Clínica
              </div>
              <div className="text-[13px] font-medium text-navy">{order.clinic || '—'}</div>
            </div>
            <div className="card-sm px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-text mb-0.5">
                <Stethoscope size={12} /> Doctor
              </div>
              <div className="text-[13px] font-medium text-navy">{order.doctor || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card-sm px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-text mb-0.5">
                <Clock size={12} /> Solicitada
              </div>
              <div className="text-[13px] font-medium text-navy">{format(parseISO(order.requestedDate), 'd MMM yyyy', { locale: es })}</div>
            </div>
            <div className="card-sm px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-text mb-0.5">
                <User size={12} /> Responsable
              </div>
              <div className="text-[13px] font-medium text-navy">{order.responsible || '—'}</div>
            </div>
          </div>

          {order.treatmentDetails && (
            <div className="card-sm px-3 py-2.5">
              <div className="text-[11px] text-slate-text mb-0.5">Detalles</div>
              <div className="text-[13px] text-navy">{order.treatmentDetails}</div>
            </div>
          )}

          {order.notes && (
            <div className="card-sm px-3 py-2.5">
              <div className="text-[11px] text-slate-text mb-0.5">Notas</div>
              <div className="text-[13px] text-navy">{order.notes}</div>
            </div>
          )}

          {order.treatmentType === 'Alineadores' && (
            <div className="card-sm px-3 py-2.5">
              <div className="text-[11px] text-slate-text mb-0.5">Alineadores</div>
              <div className="text-[13px] text-navy">
                {order.alignerQuantity ? `${order.alignerQuantity} piezas` : '—'}
                {order.alignerRange ? ` · Rango ${order.alignerRange}` : ''}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-3">
          {/* Status change */}
          <div className="flex gap-1.5 flex-wrap">
            {(['Pendiente', 'En proceso', 'Lista', 'Entregada'] as const).map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`pill text-[11px] ${order.status === s ? 'bg-navy text-white' : 'bg-black/5 text-slate-text hover:bg-black/10'}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1.5 text-[12px]">
              <Edit2 size={13} /> Editar
            </button>
            <button onClick={handleDelete} className="btn-ghost flex items-center gap-1.5 text-[12px] text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={13} /> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Order } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Circle, Triangle, Square, Diamond, Star, FileText } from 'lucide-react';

interface RecentOrdersProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const statusColors: Record<string, string> = {
  'Pendiente': 'bg-pastel-yellow text-amber-700',
  'En proceso': 'bg-pastel-blue text-blue-700',
  'Lista': 'bg-pastel-mint text-emerald-700',
  'Entregada': 'bg-gray-100 text-gray-600',
};

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

export default function RecentOrders({ orders, onSelectOrder }: RecentOrdersProps) {
  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-navy">Órdenes recientes</h3>
        <button className="text-[12px] text-blue-primary font-medium hover:underline">Ver todas →</button>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {recent.map(order => (
          <button
            key={order.id}
            onClick={() => onSelectOrder(order)}
            className="card-sm p-3 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-slate-text">{order.id}</span>
              <span className={`pill text-[10px] px-2 py-0.5 ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className="text-[12px] font-medium text-navy truncate">{order.patientName}</div>
            <div className="text-[11px] text-slate-text truncate mt-0.5 flex items-center gap-1">
              {getIcon(order.treatmentType)}
              {order.treatmentType} · {order.arch}
            </div>
            <div className="text-[10px] text-slate-text mt-1.5">
              {format(parseISO(order.requestedDate), 'd MMM', { locale: es })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

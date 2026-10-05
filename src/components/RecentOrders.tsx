import { useNavigate } from 'react-router-dom';
import { Order, TreatmentType } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentOrdersProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

// Sistema de 3 estados simplificado
function getStatusClasses(order: Order): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reqDate = parseISO(order.requestedDate);
  reqDate.setHours(0, 0, 0, 0);
  
  if (order.status !== 'Entregada' && reqDate < today) return 'bg-pastel-coral text-red-700';
  if (order.status === 'Entregada') return 'bg-pastel-mint text-emerald-700';
  return 'bg-pastel-yellow text-amber-700';
}

function getStatusLabel(order: Order): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reqDate = parseISO(order.requestedDate);
  reqDate.setHours(0, 0, 0, 0);
  
  if (order.status !== 'Entregada' && reqDate < today) return 'Atrasada';
  if (order.status === 'Entregada') return 'Entregada';
  return 'Pendiente';
}

const treatmentBg: Record<TreatmentType, string> = {
  'Alineadores': 'bg-pastel-blue',
  'Retenedores': 'bg-pastel-mint',
  'Modelos': 'bg-pastel-yellow',
  'Guías quirúrgicas': 'bg-pastel-lavender',
  'Guardas': 'bg-pastel-peach',
  'Otros': 'bg-gray-100',
};

// Custom SVG icons for treatment types
function TreatmentIcon({ type, size = 16 }: { type: TreatmentType; size?: number }) {
  const sw = 1.5;
  switch (type) {
    case 'Alineadores':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M12 2C8 2 6 4 6 8c0 3 2 6 6 6s6-3 6-6c0-4-2-6-6-6z" />
          <path d="M9 14v4c0 1 1 2 3 2s3-1 3-2v-4" />
        </svg>
      );
    case 'Retenedores':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M4 12c0-4 3-7 8-7s8 3 8 7" />
          <path d="M6 12v6c0 1 1 2 2 2h8c1 0 2-1 2-2v-6" />
          <line x1="9" y1="12" x2="9" y2="20" />
          <line x1="15" y1="12" x2="15" y2="20" />
        </svg>
      );
    case 'Modelos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case 'Guías quirúrgicas':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
        </svg>
      );
    case 'Guardas':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M12 2L4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-5z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
  }
}

export default function RecentOrders({ orders, onSelectOrder }: RecentOrdersProps) {
  const navigate = useNavigate();
  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="card p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[13px] font-semibold text-navy tracking-tight">Órdenes recientes</h3>
        <button 
          onClick={() => navigate('/orders')}
          className="text-[11px] text-blue-primary font-medium hover:underline"
        >
          Ver todas →
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {recent.map(order => (
          <button
            key={order.id}
            onClick={() => onSelectOrder(order)}
            className="card-sm p-2.5 text-left hover:shadow-md transition-all hover:-translate-y-px group"
          >
            <div className="flex items-start gap-2">
              <div className={`w-8 h-8 rounded-xl ${treatmentBg[order.treatmentType]} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <div className="text-navy">
                  <TreatmentIcon type={order.treatmentType} size={15} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-slate-text">{order.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getStatusClasses(order)}`}>
                    {getStatusLabel(order)}
                  </span>
                </div>
                <div className="text-[12px] font-medium text-navy truncate leading-tight">{order.patientName}</div>
                <div className="text-[10px] text-slate-text truncate mt-0.5 leading-tight">
                  {order.treatmentType} · {order.arch}
                </div>
                <div className="text-[10px] text-slate-text mt-1 leading-tight">
                  {format(parseISO(order.requestedDate), 'd MMM', { locale: es })}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

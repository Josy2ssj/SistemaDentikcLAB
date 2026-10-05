import { useMemo, useState } from 'react';
import { Order, TreatmentType } from '../types';
import { format, parseISO, isToday, addWeeks, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineProps {
  orders: Order[];
  weekStart: Date;
  onSelectOrder: (order: Order) => void;
}

const statusColors: Record<string, string> = {
  'Pendiente': '#f59e0b',
  'En proceso': '#3b82f6',
  'Lista': '#10b981',
  'Entregada': '#94a3b8',
};

function getStatusColor(order: Order): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reqDate = parseISO(order.requestedDate);
  reqDate.setHours(0, 0, 0, 0);
  if (order.status !== 'Entregada' && reqDate < today) return '#ef4444';
  return statusColors[order.status] || '#94a3b8';
}

function TreatmentIcon({ type, size = 18 }: { type: TreatmentType; size?: number }) {
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

function getBranchOffset(index: number, total: number): number {
  if (total === 1) return 0;
  const step = 38;
  return (index - (total - 1) / 2) * step;
}

function getDepth(index: number): number {
  const baseDepth = 45;
  const variations = [0, 18, 36, 12, 28];
  return baseDepth + variations[index % variations.length];
}

export default function Timeline({ orders, weekStart, onSelectOrder }: TimelineProps) {
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Exactly 21 days (3 weeks)
  const days = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const ordersByDate = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach(o => {
      const key = o.requestedDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return map;
  }, [orders]);

  const lineY = 50;
  const timelineHeight = 200;

  return (
    <div className="relative h-full" style={{ minHeight: timelineHeight }}>
      {/* Week headers */}
      <div className="absolute top-0 left-0 right-0 flex">
        {[0, 1, 2].map(weekIdx => {
          const wStart = addWeeks(weekStart, weekIdx);
          const wEnd = addDays(wStart, 6);
          return (
            <div key={weekIdx} className="flex-1 flex justify-center">
              <div className="text-[10px] font-semibold text-navy/60 bg-white/40 px-3 py-1 rounded-full">
                {format(wStart, 'd', { locale: es })}–{format(wEnd, 'd MMM yyyy', { locale: es })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG for lines and branches */}
      <svg
        width="100%"
        height={timelineHeight}
        className="absolute top-0 left-0"
        style={{ top: 20 }}
      >
        {/* Week separators */}
        {[1, 2].map(i => (
          <line
            key={i}
            x1={`${(i * 100) / 3}%`}
            y1={lineY - 12}
            x2={`${(i * 100) / 3}%`}
            y2={lineY + 12}
            stroke="#cbd5e1"
            strokeWidth={1}
            strokeDasharray="2,4"
            opacity={0.4}
          />
        ))}

        {/* Main baseline - perfectly straight */}
        <line
          x1="0%"
          y1={lineY}
          x2="100%"
          y2={lineY}
          stroke="#94a3b8"
          strokeWidth={1.5}
          opacity={0.3}
        />

        {/* Anchor dots along the line */}
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate.get(dateKey) || [];
          const hasOrders = dayOrders.length > 0;
          const isTodayDate = isToday(day);
          const xPercent = ((idx + 0.5) / 21) * 100;

          return (
            <circle
              key={dateKey}
              cx={`${xPercent}%`}
              cy={lineY}
              r={hasOrders ? 2.5 : isTodayDate ? 2 : 1}
              fill={isTodayDate ? '#3b82f6' : hasOrders ? '#1a1f3a' : '#cbd5e1'}
              opacity={hasOrders ? 0.6 : 0.4}
            />
          );
        })}

        {/* Branches to orders */}
        {days.map((day, dayIdx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate.get(dateKey) || [];
          if (dayOrders.length === 0) return null;

          const xPercent = ((dayIdx + 0.5) / 21) * 100;

          return dayOrders.map((order, orderIdx) => {
            const offsetX = getBranchOffset(orderIdx, dayOrders.length);
            const depth = getDepth(orderIdx);
            const nodeY = lineY + depth;
            
            // Calculate end position with offset
            const offsetPercent = (offsetX / 15) * 1; // Convert pixel offset to approximate percentage
            const endXPercent = xPercent + offsetPercent;
            
            // Organic Bezier curve
            const cp1y = lineY + depth * 0.4;
            const cp2y = lineY + depth * 0.7;

            return (
              <path
                key={order.id}
                d={`M ${xPercent}% ${lineY} C ${xPercent}% ${cp1y}, ${endXPercent}% ${cp2y}, ${endXPercent}% ${nodeY}`}
                fill="none"
                stroke={getStatusColor(order)}
                strokeWidth={1.5}
                strokeOpacity={0.35}
                strokeLinecap="round"
              />
            );
          });
        })}
      </svg>

      {/* Day labels */}
      <div className="absolute top-0 left-0 right-0 flex" style={{ top: 20 }}>
        {days.map((day, idx) => {
          const isTodayDate = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate.get(dateKey) || [];
          const hasOrders = dayOrders.length > 0;

          return (
            <div
              key={dateKey}
              className="flex-1 flex flex-col items-center"
              style={{ height: lineY }}
            >
              {hasOrders ? (
                <>
                  <span className={`text-[9px] font-semibold ${isTodayDate ? 'text-blue-primary' : 'text-navy/70'}`}>
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className={`text-[13px] font-bold ${isTodayDate ? 'text-blue-primary' : 'text-navy'}`}>
                    {format(day, 'd')}
                  </span>
                </>
              ) : (
                <div className={`w-1 h-1 rounded-full mt-5 ${isTodayDate ? 'bg-blue-primary' : 'bg-slate-300/40'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Order nodes */}
      <div className="absolute top-0 left-0 right-0" style={{ top: 20, height: timelineHeight }}>
        {days.map((day, dayIdx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate.get(dateKey) || [];
          if (dayOrders.length === 0) return null;

          return dayOrders.map((order, orderIdx) => {
            const offsetX = getBranchOffset(orderIdx, dayOrders.length);
            const depth = getDepth(orderIdx);
            const nodeY = lineY + depth;
            const color = getStatusColor(order);
            const xPercent = ((dayIdx + 0.5) / 21) * 100;

            return (
              <div
                key={order.id}
                className="absolute cursor-pointer group"
                style={{
                  left: `calc(${xPercent}% - 21px + ${offsetX}px)`,
                  top: nodeY - 21,
                  width: 42,
                  height: 42,
                }}
                onClick={() => onSelectOrder(order)}
                onMouseEnter={(e) => {
                  setHoveredOrder(order);
                  setHoverPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredOrder(null)}
              >
                <div 
                  className="w-full h-full rounded-full bg-white border border-black/5 flex items-center justify-center text-navy group-hover:scale-110 transition-transform"
                  style={{ 
                    boxShadow: `0 0 0 2px ${color}20, 0 2px 8px rgba(0,0,0,0.08)`,
                  }}
                >
                  <TreatmentIcon type={order.treatmentType} size={18} />
                </div>
                <div
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{ 
                    background: color,
                    boxShadow: `0 0 0 1.5px ${color}30`,
                  }}
                />
              </div>
            );
          });
        })}
      </div>

      {/* Hover tooltip */}
      {hoveredOrder && (
        <div
          className="fixed z-50 card-sm px-3 py-2.5 pointer-events-none"
          style={{
            left: hoverPos.x + 12,
            top: hoverPos.y - 70,
            minWidth: 200,
          }}
        >
          <div className="text-[12px] font-semibold text-navy">{hoveredOrder.patientName}</div>
          <div className="text-[11px] text-slate-text mt-0.5">{hoveredOrder.treatmentType} · {hoveredOrder.arch}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-medium" style={{ color: getStatusColor(hoveredOrder) }}>
              {hoveredOrder.status}
            </span>
            <span className="text-[11px] text-slate-text">· {hoveredOrder.responsible}</span>
          </div>
          <div className="text-[10px] text-slate-text mt-1">
            {format(parseISO(hoveredOrder.requestedDate), 'd MMM', { locale: es })}
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Order, TreatmentType } from '../types';
import { format, parseISO, isToday, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineProps {
  orders: Order[];
  weekStart: Date;
  weekEnd: Date;
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

// Custom SVG icons for treatment types - more detailed
function TreatmentIcon({ type, size = 20 }: { type: TreatmentType; size?: number }) {
  const sw = 1.5;
  switch (type) {
    case 'Alineadores':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M12 2C8 2 6 4 6 8c0 3 2 6 6 6s6-3 6-6c0-4-2-6-6-6z" />
          <path d="M9 14v4c0 1 1 2 3 2s3-1 3-2v-4" />
          <path d="M10 4c0 1 1 2 2 2s2-1 2-2" opacity="0.5" />
        </svg>
      );
    case 'Retenedores':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M4 12c0-4 3-7 8-7s8 3 8 7" />
          <path d="M6 12v6c0 1 1 2 2 2h8c1 0 2-1 2-2v-6" />
          <line x1="9" y1="12" x2="9" y2="20" />
          <line x1="15" y1="12" x2="15" y2="20" />
          <line x1="12" y1="12" x2="12" y2="20" opacity="0.3" />
        </svg>
      );
    case 'Modelos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
          <circle cx="7" cy="6" r="0.5" fill="currentColor" />
        </svg>
      );
    case 'Guías quirúrgicas':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <circle cx="12" cy="12" r="8" strokeDasharray="2 2" opacity="0.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case 'Guardas':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M12 2L4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-5z" />
          <path d="M9 12l2 2 4-4" strokeWidth={2} />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
  }
}

function getBranchOffset(index: number, total: number): number {
  if (total === 1) return 0;
  const spread = Math.min(total - 1, 4);
  const step = 44; // Slightly wider spread for better separation
  return (index - (total - 1) / 2) * step;
}

function getDepth(index: number): number {
  // Better vertical distribution
  const baseDepth = 80;
  const variations = [0, 25, 50, 20, 40];
  return baseDepth + variations[index % variations.length];
}

export default function Timeline({ orders, weekStart, weekEnd, onSelectOrder }: TimelineProps) {
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const days = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
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

  const dayWidth = 90;
  const totalWidth = days.length * dayWidth;
  const lineY = 70; // More space for week headers

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const wStart = addWeeks(weekStart, i);
      const wEnd = addWeeks(wStart, 6);
      result.push({ start: wStart, end: wEnd, index: i });
    }
    return result;
  }, [weekStart]);

  return (
    <div className="relative h-full min-h-[320px]">
      {/* Week headers - more prominent */}
      <div className="absolute top-0 left-0 flex" style={{ width: totalWidth }}>
        {weeks.map((week, idx) => (
          <div key={idx} className="flex flex-col items-center" style={{ width: dayWidth * 7 }}>
            <div className="text-[11px] font-semibold text-navy/70 mb-1.5 tracking-wide bg-white/50 px-3 py-0.5 rounded-full">
              {format(week.start, 'd', { locale: es })} – {format(week.end, "d MMM yyyy", { locale: es })}
            </div>
          </div>
        ))}
      </div>

      {/* SVG for lines */}
      <svg
        width={totalWidth}
        height={320}
        className="absolute top-0 left-0"
        style={{ minWidth: totalWidth, top: 24 }}
      >
        {/* Week separators - subtle vertical lines */}
        {[1, 2].map(i => {
          const x = i * 7 * dayWidth;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={lineY - 20}
                x2={x}
                y2={lineY + 20}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="3,5"
                opacity={0.4}
              />
            </g>
          );
        })}

        {/* Main baseline - more visible */}
        <line
          x1={0}
          y1={lineY}
          x2={totalWidth}
          y2={lineY}
          stroke="#94a3b8"
          strokeWidth={2}
          opacity={0.3}
        />
        {/* Baseline highlight */}
        <line
          x1={0}
          y1={lineY}
          x2={totalWidth}
          y2={lineY}
          stroke="#cbd5e1"
          strokeWidth={1}
        />

        {/* Branches to orders - more organic */}
        {days.map((day, dayIdx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate.get(dateKey) || [];
          if (dayOrders.length === 0) return null;

          const anchorX = dayIdx * dayWidth + dayWidth / 2;

          return dayOrders.map((order, orderIdx) => {
            const offsetX = getBranchOffset(orderIdx, dayOrders.length);
            const depth = getDepth(orderIdx);
            const nodeX = anchorX + offsetX;
            const nodeY = lineY + depth;

            // More organic Bezier curves with varied control points
            const curveVariation = (orderIdx % 2 === 0) ? 0.35 : 0.45;
            const cp1x = anchorX + (offsetX * 0.2);
            const cp1y = lineY + depth * curveVariation;
            const cp2x = nodeX - (offsetX * 0.3);
            const cp2y = lineY + depth * 0.65;

            return (
              <path
                key={order.id}
                d={`M ${anchorX} ${lineY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nodeX} ${nodeY}`}
                fill="none"
                stroke={getStatusColor(order)}
                strokeWidth={2}
                strokeOpacity={0.35}
                strokeLinecap="round"
              />
            );
          });
        })}
      </svg>

      {/* Day labels and anchors */}
      <div className="absolute top-0 left-0 flex" style={{ width: totalWidth, top: 24 }}>
        {days.map((day, idx) => {
          const isTodayDate = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate.get(dateKey) || [];
          const hasOrders = dayOrders.length > 0;

          return (
            <div
              key={dateKey}
              className="flex flex-col items-center"
              style={{ width: dayWidth, height: lineY }}
            >
              {hasOrders ? (
                <>
                  <span className={`text-[10px] font-semibold ${isTodayDate ? 'text-blue-primary' : 'text-navy/80'}`}>
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className={`text-[15px] font-bold ${isTodayDate ? 'text-blue-primary' : 'text-navy'}`}>
                    {format(day, 'd')}
                  </span>
                  {/* Anchor dot for days with orders */}
                  <div className={`w-2 h-2 rounded-full mt-1 ${isTodayDate ? 'bg-blue-primary' : 'bg-navy/30'}`} />
                </>
              ) : (
                <div className={`w-1 h-1 rounded-full mt-7 ${isTodayDate ? 'bg-blue-primary' : 'bg-slate-300/50'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Order nodes - more sophisticated */}
      <div className="absolute top-0 left-0" style={{ width: totalWidth, height: 320, top: 24 }}>
        {days.map((day, dayIdx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate.get(dateKey) || [];
          if (dayOrders.length === 0) return null;

          const anchorX = dayIdx * dayWidth + dayWidth / 2;

          return dayOrders.map((order, orderIdx) => {
            const offsetX = getBranchOffset(orderIdx, dayOrders.length);
            const depth = getDepth(orderIdx);
            const nodeX = anchorX + offsetX;
            const nodeY = lineY + depth;
            const color = getStatusColor(order);

            return (
              <div
                key={order.id}
                className="absolute cursor-pointer group"
                style={{
                  left: nodeX - 24,
                  top: nodeY - 24,
                  width: 48,
                  height: 48,
                }}
                onClick={() => onSelectOrder(order)}
                onMouseEnter={(e) => {
                  setHoveredOrder(order);
                  setHoverPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredOrder(null)}
              >
                {/* Outer glow */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ 
                    background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                    transform: 'scale(1.3)',
                  }}
                />
                {/* Main node */}
                <div 
                  className="relative w-full h-full rounded-full bg-white border-2 border-white/80 flex items-center justify-center text-navy group-hover:scale-110 transition-transform"
                  style={{ 
                    boxShadow: `0 0 0 3px ${color}20, 0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.06)`,
                  }}
                >
                  <TreatmentIcon type={order.treatmentType} size={22} />
                </div>
                {/* Status dot with enhanced halo */}
                <div
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[2.5px] border-white"
                  style={{ 
                    background: color,
                    boxShadow: `0 0 0 2px ${color}40, 0 2px 4px rgba(0,0,0,0.1)`,
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
          className="fixed z-50 card-sm px-3.5 py-3 pointer-events-none"
          style={{
            left: hoverPos.x + 14,
            top: hoverPos.y - 80,
            minWidth: 220,
          }}
        >
          <div className="text-[13px] font-semibold text-navy">{hoveredOrder.patientName}</div>
          <div className="text-[11px] text-slate-text mt-0.5">{hoveredOrder.treatmentType} · {hoveredOrder.arch}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ 
              color: getStatusColor(hoveredOrder),
              background: `${getStatusColor(hoveredOrder)}15`
            }}>
              {hoveredOrder.status}
            </span>
            <span className="text-[11px] text-slate-text">· {hoveredOrder.responsible}</span>
          </div>
          <div className="text-[10px] text-slate-text mt-1.5 pt-1.5 border-t border-black/5">
            Entrega: {format(parseISO(hoveredOrder.requestedDate), 'd MMM yyyy', { locale: es })}
          </div>
        </div>
      )}
    </div>
  );
}

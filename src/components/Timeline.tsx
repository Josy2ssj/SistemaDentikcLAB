import { useMemo, useState } from 'react';
import { Order, TreatmentType } from '../types';
import { eachDayOfInterval, format, parseISO, isToday, isSameDay, startOfWeek, addDays, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { Circle, Triangle, Square, Diamond, Star, FileText } from 'lucide-react';

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

function getTreatmentIcon(type: TreatmentType) {
  const size = 14;
  const sw = 1.5;
  switch (type) {
    case 'Alineadores': return <Circle size={size} strokeWidth={sw} />;
    case 'Retenedores': return <Triangle size={size} strokeWidth={sw} />;
    case 'Modelos': return <Square size={size} strokeWidth={sw} />;
    case 'Guías quirúrgicas': return <Diamond size={size} strokeWidth={sw} />;
    case 'Guardas': return <Star size={size} strokeWidth={sw} />;
    default: return <FileText size={size} strokeWidth={sw} />;
  }
}

function getBranchOffset(index: number, total: number): number {
  if (total === 1) return 0;
  const spread = Math.min(total - 1, 4);
  const step = 36;
  return (index - (total - 1) / 2) * step;
}

function getDepth(index: number): number {
  return 60 + (index % 3) * 18;
}

export default function Timeline({ orders, weekStart, weekEnd, onSelectOrder }: TimelineProps) {
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: addDays(weekEnd, -1) });
  }, [weekStart, weekEnd]);

  // Group orders by requestedDate
  const ordersByDate = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach(o => {
      const key = o.requestedDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return map;
  }, [orders]);

  const dayWidth = 80;
  const totalWidth = days.length * dayWidth;
  const lineY = 50;

  // Create week separators
  const weekSeparators = useMemo(() => {
    const seps: Date[] = [];
    let current = weekStart;
    while (current < weekEnd) {
      seps.push(current);
      current = addWeeks(current, 1);
    }
    return seps;
  }, [weekStart, weekEnd]);

  return (
    <div className="relative h-full min-h-[240px]">
      {/* SVG for lines */}
      <svg
        width={totalWidth}
        height={240}
        className="absolute top-0 left-0"
        style={{ minWidth: totalWidth }}
      >
        {/* Main baseline - perfectly straight */}
        <line
          x1={0}
          y1={lineY}
          x2={totalWidth}
          y2={lineY}
          stroke="#e2e8f0"
          strokeWidth={2}
        />

        {/* Week separators */}
        {weekSeparators.map((sep, i) => {
          const dayIndex = days.findIndex(d => isSameDay(d, sep));
          if (dayIndex === -1) return null;
          const x = dayIndex * dayWidth + dayWidth / 2;
          return (
            <line
              key={i}
              x1={x - dayWidth / 2}
              y1={lineY - 8}
              x2={x - dayWidth / 2}
              y2={lineY + 8}
              stroke="#cbd5e1"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          );
        })}

        {/* Branches to orders */}
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

            // Curved path from anchor to node
            const cp1x = anchorX;
            const cp1y = lineY + depth * 0.3;
            const cp2x = nodeX;
            const cp2y = lineY + depth * 0.7;

            return (
              <path
                key={order.id}
                d={`M ${anchorX} ${lineY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nodeX} ${nodeY}`}
                fill="none"
                stroke={getStatusColor(order)}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
            );
          });
        })}
      </svg>

      {/* Day labels */}
      <div className="absolute top-0 left-0 flex" style={{ width: totalWidth }}>
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
                  <span className={`text-[10px] font-medium ${isTodayDate ? 'text-blue-primary' : 'text-navy'}`}>
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className={`text-[13px] font-semibold ${isTodayDate ? 'text-blue-primary' : 'text-navy'}`}>
                    {format(day, 'd')}
                  </span>
                </>
              ) : (
                <div className={`w-1.5 h-1.5 rounded-full mt-5 ${isTodayDate ? 'bg-blue-primary' : 'bg-slate-300'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Order nodes */}
      <div className="absolute top-0 left-0" style={{ width: totalWidth, height: 240 }}>
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
                  left: nodeX - 16,
                  top: nodeY - 16,
                  width: 32,
                  height: 32,
                }}
                onClick={() => onSelectOrder(order)}
                onMouseEnter={(e) => {
                  setHoveredOrder(order);
                  setHoverPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredOrder(null)}
              >
                <div className="w-8 h-8 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center text-navy group-hover:shadow-md transition-shadow"
                  style={{ boxShadow: `0 0 0 2px ${color}20, 0 1px 3px rgba(0,0,0,0.08)` }}
                >
                  {getTreatmentIcon(order.treatmentType)}
                </div>
                {/* Status dot */}
                <div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: color }}
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
            top: hoverPos.y - 60,
            minWidth: 180,
          }}
        >
          <div className="text-[12px] font-semibold text-navy">{hoveredOrder.patientName}</div>
          <div className="text-[11px] text-slate-text">{hoveredOrder.treatmentType} · {hoveredOrder.arch}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-medium" style={{ color: getStatusColor(hoveredOrder) }}>
              {hoveredOrder.status}
            </span>
            <span className="text-[11px] text-slate-text">· {hoveredOrder.responsible}</span>
          </div>
          <div className="text-[10px] text-slate-text mt-0.5">
            Entrega: {format(parseISO(hoveredOrder.requestedDate), 'd MMM', { locale: es })}
          </div>
        </div>
      )}

      {/* Bottom navigator */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-t border-black/5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-navy">
            {format(weekStart, 'MMMM yyyy', { locale: es })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIdx) => {
            const todayIdx = days.findIndex(d => isToday(d));
            const currentWeekIdx = todayIdx >= 0 ? Math.floor(todayIdx / 7) : 0;
            const isActive = weekIdx === currentWeekIdx;
            const wStart = addDays(weekStart, weekIdx * 7);
            const wEnd = addDays(wStart, 6);
            return (
              <div
                key={weekIdx}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  isActive ? 'bg-navy text-white' : 'bg-black/5 text-slate-text'
                }`}
              >
                {format(wStart, 'd')}–{format(wEnd, 'd')}
              </div>
            );
          })}
        </div>
        <div className="text-[12px] text-slate-text">
          {format(addDays(weekEnd, -1), 'MMMM yyyy', { locale: es })}
        </div>
      </div>
    </div>
  );
}

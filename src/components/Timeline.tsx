import { useMemo, useState } from 'react';
import { Order, TreatmentType } from '../types';
import { format, parseISO, isToday, addWeeks, addDays, startOfWeek, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineProps {
  orders: Order[];
  currentDate: Date;
  weekOffset: number;
  onSelectOrder: (order: Order) => void;
  onWeekChange: (offset: number) => void;
}

// Sistema de 3 estados simplificado
function getStatusColor(order: Order): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reqDate = parseISO(order.requestedDate);
  reqDate.setHours(0, 0, 0, 0);
  
  if (order.status !== 'Entregada' && reqDate < today) return '#ef4444';
  if (order.status === 'Entregada') return '#10b981';
  return '#f59e0b';
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

export default function Timeline({ orders, currentDate, weekOffset, onSelectOrder, onWeekChange }: TimelineProps) {
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Calcular rango de 3 semanas: pasada parcial + actual + siguiente
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const baseWeekStart = addWeeks(currentWeekStart, weekOffset);
  
  // 3 semanas: 7 días de la pasada + 7 de la actual + 7 de la siguiente = 21 días
  const days = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => addDays(baseWeekStart, i));
  }, [baseWeekStart]);

  // Agrupar órdenes por fecha
  const ordersByDate = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach(o => {
      const key = o.requestedDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return map;
  }, [orders]);

  // Configuración visual
  const lineY = 80;
  const timelineHeight = 280;
  const dayWidth = 100;
  const totalWidth = days.length * dayWidth;

  // Calcular posiciones de órdenes con curvas que no choquen
  const orderPositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number; curve: number }>();
    
    days.forEach((day, dayIdx) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayOrders = ordersByDate.get(dateKey) || [];
      
      if (dayOrders.length === 0) return;
      
      const baseX = dayIdx * dayWidth + dayWidth / 2;
      
      dayOrders.forEach((order, orderIdx) => {
        // Distribuir órdenes en abanico para evitar choques
        const angle = (orderIdx / Math.max(dayOrders.length - 1, 1)) * Math.PI - Math.PI / 2;
        const radius = 50 + (orderIdx * 15);
        const offsetX = Math.cos(angle) * radius * 0.3;
        const offsetY = Math.sin(angle) * radius * 0.5 + 40;
        
        positions.set(order.id, {
          x: baseX + offsetX,
          y: lineY + offsetY,
          curve: offsetX * 0.5
        });
      });
    });
    
    return positions;
  }, [days, ordersByDate, lineY]);

  // Encontrar índice del día actual
  const todayIndex = days.findIndex(d => isToday(d));

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Contenedor principal del timeline */}
      <div className="flex-1 relative">
        {/* Flecha izquierda */}
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-md hover:shadow-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Flecha derecha */}
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-md hover:shadow-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Área scrollable del timeline */}
        <div className="w-full h-full overflow-x-auto overflow-y-hidden timeline-scroll">
          <div className="relative h-full" style={{ width: totalWidth, minHeight: timelineHeight }}>
            
            {/* Indicador de "HOY" - línea vertical + glow */}
            {todayIndex >= 0 && (
              <>
                <div
                  className="absolute top-0 bottom-0 w-px bg-blue-primary/30"
                  style={{ left: todayIndex * dayWidth + dayWidth / 2 }}
                />
                <div
                  className="absolute top-0 bottom-0 w-16 bg-gradient-to-b from-blue-primary/10 via-blue-primary/5 to-transparent"
                  style={{ left: todayIndex * dayWidth + dayWidth / 2 - 32 }}
                />
                <div
                  className="absolute top-2 px-2 py-0.5 rounded-full bg-blue-primary text-white text-[10px] font-bold shadow-md"
                  style={{ left: todayIndex * dayWidth + dayWidth / 2 - 15 }}
                >
                  HOY
                </div>
              </>
            )}

            {/* SVG para líneas y ramas */}
            <svg width={totalWidth} height={timelineHeight} className="absolute top-0 left-0">
              <defs>
                {/* Gradientes para ramas */}
                {Array.from(orderPositions.entries()).map(([orderId, pos]) => {
                  const order = orders.find(o => o.id === orderId);
                  if (!order) return null;
                  const color = getStatusColor(order);
                  return (
                    <linearGradient key={`grad-${orderId}`} id={`grad-${orderId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* Línea principal */}
              <line
                x1="0"
                y1={lineY}
                x2={totalWidth}
                y2={lineY}
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.4"
              />

              {/* Puntos de anclaje para cada día */}
              {days.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayOrders = ordersByDate.get(dateKey) || [];
                const hasOrders = dayOrders.length > 0;
                const isTodayDate = isToday(day);
                const x = idx * dayWidth + dayWidth / 2;

                return (
                  <circle
                    key={`anchor-${dateKey}`}
                    cx={x}
                    cy={lineY}
                    r={hasOrders ? 6 : isTodayDate ? 5 : 2}
                    fill={hasOrders ? '#1e293b' : isTodayDate ? '#3b82f6' : '#cbd5e1'}
                    opacity={hasOrders ? 0.8 : isTodayDate ? 1 : 0.3}
                  />
                );
              })}

              {/* Ramas con curvas y degradados */}
              {Array.from(orderPositions.entries()).map(([orderId, pos]) => {
                const order = orders.find(o => o.id === orderId);
                if (!order) return null;
                
                const dateKey = order.requestedDate;
                const dayIdx = days.findIndex(d => format(d, 'yyyy-MM-dd') === dateKey);
                if (dayIdx < 0) return null;
                
                const startX = dayIdx * dayWidth + dayWidth / 2;
                const startY = lineY;
                const endX = pos.x;
                const endY = pos.y;
                const curve = pos.curve;

                // Curva Bezier suave
                const path = `M ${startX} ${startY} Q ${startX + curve} ${(startY + endY) / 2}, ${endX} ${endY}`;

                return (
                  <path
                    key={`branch-${orderId}`}
                    d={path}
                    fill="none"
                    stroke={`url(#grad-${orderId})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {/* Etiquetas de días */}
            <div className="absolute top-0 left-0 flex" style={{ width: totalWidth }}>
              {days.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayOrders = ordersByDate.get(dateKey) || [];
                const hasOrders = dayOrders.length > 0;
                const isTodayDate = isToday(day);
                const x = idx * dayWidth;

                return (
                  <div
                    key={`label-${dateKey}`}
                    className="absolute flex flex-col items-center"
                    style={{ left: x, width: dayWidth, top: lineY - 50 }}
                  >
                    {hasOrders && (
                      <>
                        <div className={`text-[10px] font-semibold ${isTodayDate ? 'text-blue-primary' : 'text-navy/70'}`}>
                          {format(day, 'EEE', { locale: es })}
                        </div>
                        <div className={`text-[14px] font-bold ${isTodayDate ? 'text-blue-primary' : 'text-navy'}`}>
                          {format(day, 'd')}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nodos de órdenes */}
            {Array.from(orderPositions.entries()).map(([orderId, pos]) => {
              const order = orders.find(o => o.id === orderId);
              if (!order) return null;
              
              const color = getStatusColor(order);

              return (
                <div
                  key={`node-${orderId}`}
                  className="absolute cursor-pointer group"
                  style={{
                    left: pos.x - 21,
                    top: pos.y - 21,
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
                  {/* Nodo principal */}
                  <div 
                    className="w-full h-full rounded-full bg-white border-2 border-white flex items-center justify-center text-navy group-hover:scale-110 transition-transform shadow-lg"
                    style={{ 
                      boxShadow: `0 0 0 3px ${color}30, 0 4px 12px rgba(0,0,0,0.15)`,
                    }}
                  >
                    <TreatmentIcon type={order.treatmentType} size={18} />
                  </div>
                  
                  {/* Indicador de estado con halo */}
                  <div
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{ 
                      background: color,
                      boxShadow: `0 0 0 2px ${color}40, 0 0 8px ${color}60`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Tooltip hover */}
        {hoveredOrder && (
          <div
            className="fixed z-50 card-sm px-4 py-3 pointer-events-none shadow-xl"
            style={{
              left: hoverPos.x + 16,
              top: hoverPos.y - 120,
              minWidth: 240,
            }}
          >
            <div className="text-[13px] font-bold text-navy mb-1">{hoveredOrder.patientName}</div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-text">Tratamiento:</span>
                <span className="font-medium text-navy">{hoveredOrder.treatmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-text">Arcada:</span>
                <span className="font-medium text-navy">{hoveredOrder.arch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-text">Fecha inicial:</span>
                <span className="font-medium text-navy">{format(parseISO(hoveredOrder.createdAt), 'd MMM', { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-text">Fecha solicitada:</span>
                <span className="font-medium text-navy">{format(parseISO(hoveredOrder.requestedDate), 'd MMM', { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-text">Estado:</span>
                <span className="font-bold" style={{ color: getStatusColor(hoveredOrder) }}>
                  {getStatusLabel(hoveredOrder)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-text">Responsable:</span>
                <span className="font-medium text-navy">{hoveredOrder.responsible}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minimapa inferior */}
      <div className="h-16 border-t border-black/5 bg-gradient-to-r from-black/[0.02] via-black/[0.03] to-black/[0.02] flex items-center px-6 gap-4">
        {/* Controles izquierda */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onWeekChange(weekOffset - 1)}
            className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-sm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => onWeekChange(weekOffset + 1)}
            className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-sm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="w-px h-4 bg-black/10 mx-1" />
          <span className="text-[11px] font-semibold text-navy">
            {format(baseWeekStart, 'MMM yyyy', { locale: es })}
          </span>
        </div>

        {/* Minimapa visual */}
        <div className="flex-1 relative h-full flex items-center">
          <div className="w-full h-2 bg-black/5 rounded-full relative overflow-hidden">
            {/* Progreso */}
            <div 
              className="absolute top-0 left-0 h-full bg-blue-primary/30 rounded-full"
              style={{ width: '33%' }}
            />
            
            {/* Puntos de órdenes */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-2">
              {days.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayOrders = ordersByDate.get(dateKey) || [];
                const hasOrders = dayOrders.length > 0;
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={`mini-${dateKey}`}
                    className={`rounded-full transition-all ${
                      isTodayDate
                        ? 'w-2 h-2 bg-blue-primary shadow-sm'
                        : hasOrders
                        ? 'w-1.5 h-1.5 bg-navy/60'
                        : 'w-1 h-1 bg-black/20'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Separadores de semanas */}
          {[1, 2].map(i => (
            <div
              key={`sep-${i}`}
              className="absolute top-0 bottom-0 w-px bg-black/10"
              style={{ left: `${(i * 100) / 3}%` }}
            />
          ))}
        </div>

        {/* Selector de semanas */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(weekIdx => {
            const wStart = addWeeks(baseWeekStart, weekIdx);
            const wEnd = addDays(wStart, 6);
            const isActive = weekIdx === 1; // Semana del medio es la "actual"

            return (
              <div
                key={`week-${weekIdx}`}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                  isActive ? 'bg-navy text-white shadow-sm' : 'text-slate-text hover:bg-black/5'
                }`}
              >
                {format(wStart, 'd')}–{format(wEnd, 'd')}
              </div>
            );
          })}
        </div>

        <div className="w-px h-4 bg-black/10 mx-2" />
        <span className="text-[11px] font-medium text-slate-text">
          {format(addDays(baseWeekStart, 20), 'MMM yyyy', { locale: es })}
        </span>
      </div>
    </div>
  );
}

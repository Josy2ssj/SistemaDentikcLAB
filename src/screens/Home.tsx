import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Order } from '../types';
import { format, startOfWeek, addWeeks, addDays, isBefore, parseISO, startOfDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Plus, ChevronLeft, ChevronRight, Sun, Bell, ChevronDown } from 'lucide-react';
import Timeline from '../components/Timeline';
import OrderModal from '../components/OrderModal';
import OrderDetail from '../components/OrderDetail';
import RecentOrders from '../components/RecentOrders';
import UtilityRail from '../components/UtilityRail';

export default function Home() {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const today = startOfDay(new Date());
  const weekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), weekOffset);
  const weekEnd = addWeeks(weekStart, 3);

  const todayOrders = state.orders.filter(o => {
    const req = parseISO(o.requestedDate);
    return req.getTime() === today.getTime();
  });

  const overdueOrders = state.orders.filter(o => {
    if (o.status === 'Entregada') return false;
    return isBefore(parseISO(o.requestedDate), today);
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  const filteredOrders = useMemo(() => {
    let orders = state.orders;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      orders = orders.filter(o =>
        o.patientName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.treatmentType.toLowerCase().includes(q)
      );
    }
    return orders;
  }, [state.orders, searchQuery]);

  return (
    <div className="flex h-full">
      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Global header - spans workspace area */}
        <header className="flex items-start justify-between px-7 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-start gap-2.5">
            <div className="mt-1.5">
              <Sun size={16} className="text-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-navy leading-tight tracking-tight">{greeting}, Josy</h1>
              <p className="text-[12.5px] text-slate-text mt-0.5 leading-snug">
                Hoy tienes <span className="font-medium text-navy">{todayOrders.length} órdenes programadas</span> y <span className="font-medium text-red-500">{overdueOrders.length} atrasadas</span>.
              </p>
            </div>
          </div>
          {/* Profile controls - far right */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text" />
              <input
                type="text"
                placeholder="Buscar paciente, orden..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-8 pr-3 w-[240px] h-[34px] text-[12px] bg-white/80"
              />
            </div>
            <button className="relative w-[34px] h-[34px] rounded-full bg-white/80 border border-black/5 flex items-center justify-center text-slate-text hover:text-navy transition-colors">
              <Bell size={15} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/60 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[12px] font-semibold shadow-sm">J</div>
              <div className="text-left hidden xl:block">
                <div className="text-[12px] font-semibold text-navy leading-tight">Josy</div>
                <div className="text-[10px] text-slate-text leading-tight">Administrador</div>
              </div>
              <ChevronDown size={12} className="text-slate-text hidden xl:block" />
            </button>
          </div>
        </header>

        {/* Date block - right aligned below header */}
        <div className="px-7 pb-2 flex-shrink-0 flex justify-end">
          <div className="text-right">
            <div className="text-[12px] font-medium text-navy capitalize">{format(today, 'EEEE', { locale: es })}</div>
            <div className="text-[11px] text-slate-text">{format(today, "d 'de' MMMM, yyyy", { locale: es })}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-7 pb-3 flex-shrink-0">
          <div className="flex gap-2">
            {[
              { label: 'Nueva orden', sub: 'Crear orden de trabajo', icon: '📋', action: () => setShowModal(true), bg: 'bg-pastel-blue' },
              { label: 'Pacientes', sub: 'Ver registro', icon: '👤', action: () => {}, bg: 'bg-pastel-mint' },
              { label: 'Captura 3D', sub: 'Escanear y exportar', icon: '🦷', action: () => {}, bg: 'bg-pastel-lavender' },
              { label: 'Inventario', sub: 'Materiales y stock', icon: '📦', action: () => {}, bg: 'bg-pastel-yellow' },
              { label: 'Horario', sub: 'Ver turnos del equipo', icon: '📅', action: () => {}, bg: 'bg-pastel-peach' },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex-1 card-sm px-2.5 py-2 flex items-center gap-2 hover:shadow-md transition-all hover:-translate-y-px text-left group"
              >
                <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center text-[14px] flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11.5px] font-semibold text-navy truncate leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-text truncate leading-tight mt-0.5">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline section - flex-1 */}
        <div className="flex-1 px-7 pb-2.5 overflow-hidden flex flex-col min-h-0">
          <div className="card flex-1 flex flex-col overflow-hidden">
            {/* Timeline header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-black/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-[14px] font-semibold text-navy tracking-tight">Órdenes</h2>
                <div className="flex gap-0.5 bg-black/[0.03] rounded-full p-0.5">
                  {['Semana', 'Mes', 'Año'].map(v => (
                    <button key={v} className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      v === 'Semana' ? 'pill-active' : 'text-slate-text hover:text-navy'
                    }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setWeekOffset(w => w - 1)} className="w-7 h-7 rounded-full bg-white border border-black/5 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/10 transition-all">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setWeekOffset(w => w + 1)} className="w-7 h-7 rounded-full bg-white border border-black/5 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/10 transition-all">
                  <ChevronRight size={14} />
                </button>
                <div className="px-3 py-1 rounded-full bg-black/[0.03] text-[11px] font-medium text-navy">
                  {format(weekStart, 'd MMM', { locale: es })} — {format(addDays(weekStart, 20), 'd MMM yyyy', { locale: es })}
                </div>
                <button onClick={() => setWeekOffset(0)} className="px-2.5 py-1 rounded-full bg-black/[0.03] text-[11px] font-medium text-slate-text hover:text-navy transition-colors">
                  Hoy
                </button>
                <button className="w-7 h-7 rounded-full bg-white border border-black/5 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/10 transition-all">
                  <Search size={13} />
                </button>
                <button onClick={() => setShowModal(true)} className="w-7 h-7 rounded-full bg-blue-primary flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all">
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Timeline body */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden timeline-scroll px-4 py-3 min-h-0">
              <Timeline
                orders={filteredOrders}
                weekStart={weekStart}
                weekEnd={weekEnd}
                onSelectOrder={setSelectedOrder}
              />
            </div>

            {/* Bottom navigator */}
            <div className="px-4 pb-2.5 flex-shrink-0">
              <div className="flex items-center justify-between bg-black/[0.02] rounded-2xl px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setWeekOffset(w => w - 1)} className="w-6 h-6 rounded-full bg-white border border-black/5 flex items-center justify-center text-slate-text hover:text-navy transition-all">
                    <ChevronLeft size={12} />
                  </button>
                  <button onClick={() => setWeekOffset(w => w + 1)} className="w-6 h-6 rounded-full bg-white border border-black/5 flex items-center justify-center text-slate-text hover:text-navy transition-all">
                    <ChevronRight size={12} />
                  </button>
                  <span className="text-[11px] font-medium text-navy ml-1">
                    {format(weekStart, 'MMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Mini timeline dots */}
                  <div className="flex items-center gap-0.5 mx-2">
                    {Array.from({ length: 21 }).map((_, i) => {
                      const dayDate = new Date(weekStart);
                      dayDate.setDate(dayDate.getDate() + i);
                      const dateKey = format(dayDate, 'yyyy-MM-dd');
                      const hasOrders = filteredOrders.some(o => o.requestedDate === dateKey);
                      const isTodayDate = isToday(dayDate);
                      return (
                        <div
                          key={i}
                          className={`rounded-full transition-all ${
                            isTodayDate
                              ? 'w-1.5 h-1.5 bg-blue-primary'
                              : hasOrders
                              ? 'w-1 h-1 bg-navy/40'
                              : 'w-0.5 h-0.5 bg-black/15'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, weekIdx) => {
                    const wStart = addWeeks(weekStart, weekIdx);
                    const wEnd = addWeeks(wStart, 6);
                    const todayIdx = (() => {
                      const today = startOfDay(new Date());
                      const diff = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                      return Math.floor(diff / 7);
                    })();
                    const isActive = weekIdx === Math.max(0, Math.min(2, todayIdx));
                    return (
                      <div
                        key={weekIdx}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                          isActive ? 'bg-navy text-white' : 'text-slate-text hover:bg-black/5'
                        }`}
                      >
                        {format(wStart, 'd')}–{format(wEnd, 'd')}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-text ml-2">
                  {format(addDays(weekStart, 20), 'MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="px-7 pb-4 flex-shrink-0">
          <RecentOrders orders={state.orders} onSelectOrder={setSelectedOrder} />
        </div>
      </div>

      {/* RIGHT UTILITY RAIL */}
      <UtilityRail />

      {/* Modals */}
      {showModal && <OrderModal onClose={() => setShowModal(false)} />}
      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

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
    <div className="flex h-full flex-col">
      {/* GLOBAL HEADER - spans full width */}
      <header className="flex items-center justify-between px-7 pt-5 pb-3 flex-shrink-0">
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
        {/* User cluster - far right of entire shell */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-full px-2.5 py-1.5 shadow-sm">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text/70" />
            <input
              type="text"
              placeholder="Buscar paciente, orden..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-8 pr-3 w-[230px] h-[30px] text-[11.5px] bg-transparent border-none focus:ring-0 placeholder:text-slate-text/50"
            />
          </div>
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-black/10 to-transparent" />
          <button className="relative w-[30px] h-[30px] rounded-full hover:bg-black/5 flex items-center justify-center text-slate-text hover:text-navy transition-all">
            <Bell size={14} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white shadow-sm" />
          </button>
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-black/10 to-transparent" />
          <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-black/5 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[12px] font-bold shadow-sm">J</div>
            <div className="text-left hidden xl:block">
              <div className="text-[11.5px] font-bold text-navy leading-tight">Josy</div>
              <div className="text-[9.5px] text-slate-text leading-tight">Administrador</div>
            </div>
            <ChevronDown size={11} className="text-slate-text/70 hidden xl:block" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* CENTER WORKSPACE */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Date block */}
          <div className="px-7 pb-2 flex-shrink-0 flex justify-end">
            <div className="text-right bg-white/50 rounded-full px-3 py-1 border border-black/5">
              <div className="text-[11px] font-semibold text-navy capitalize">{format(today, 'EEEE', { locale: es })}</div>
              <div className="text-[10px] text-slate-text">{format(today, "d 'de' MMMM, yyyy", { locale: es })}</div>
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

          {/* Timeline section */}
          <div className="flex-1 px-7 pb-3 overflow-hidden flex flex-col min-h-0">
            <div className="card flex-1 flex flex-col overflow-hidden">
              {/* Timeline header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-black/5 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-[15px] font-bold text-navy tracking-tight">Órdenes</h2>
                  <div className="flex gap-0.5 bg-gradient-to-r from-black/[0.03] to-black/[0.05] rounded-full p-0.5 shadow-inner">
                    {['Semana', 'Mes', 'Año'].map(v => (
                      <button key={v} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                        v === 'Semana' ? 'pill-active' : 'text-slate-text hover:text-navy hover:bg-white/50'
                      }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100/50 text-[11px] font-semibold text-navy border border-blue-200/30">
                    {format(weekStart, 'd MMM', { locale: es })} — {format(addDays(weekStart, 20), 'd MMM yyyy', { locale: es })}
                  </div>
                  <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-semibold text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-sm">
                    Hoy
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-sm">
                    <Search size={14} />
                  </button>
                  <button onClick={() => setShowModal(true)} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-105 transition-all">
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Timeline body */}
              <div className="flex-1 px-5 py-3 min-h-0">
                <Timeline
                  orders={filteredOrders}
                  currentDate={today}
                  weekOffset={weekOffset}
                  onSelectOrder={setSelectedOrder}
                  onWeekChange={setWeekOffset}
                />
              </div>

              {/* Bottom navigator */}
              <div className="px-4 pb-3 flex-shrink-0">
                <div className="flex items-center justify-between bg-gradient-to-r from-black/[0.02] via-black/[0.03] to-black/[0.02] rounded-2xl px-4 py-2.5 border border-black/5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setWeekOffset(w => w - 1)} className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-sm">
                      <ChevronLeft size={13} />
                    </button>
                    <button onClick={() => setWeekOffset(w => w + 1)} className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-sm">
                      <ChevronRight size={13} />
                    </button>
                    <div className="w-px h-4 bg-black/10 mx-1" />
                    <span className="text-[11px] font-semibold text-navy">
                      {format(weekStart, 'MMM yyyy', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-[400px] mx-4">
                    <div className="flex-1 relative">
                      <div className="h-1 bg-black/5 rounded-full" />
                      <div className="absolute top-0 left-0 h-1 bg-blue-primary/30 rounded-full" style={{ width: '33%' }} />
                      <div className="flex items-center justify-between mt-1">
                        {Array.from({ length: 21 }).map((_, i) => {
                          const dayDate = addDays(weekStart, i);
                          const dateKey = format(dayDate, 'yyyy-MM-dd');
                          const hasOrders = filteredOrders.some(o => o.requestedDate === dateKey);
                          const isTodayDate = isToday(dayDate);
                          return (
                            <div
                              key={i}
                              className={`rounded-full transition-all ${
                                isTodayDate
                                  ? 'w-2 h-2 bg-blue-primary shadow-sm'
                                  : hasOrders
                                  ? 'w-1.5 h-1.5 bg-navy/50'
                                  : 'w-1 h-1 bg-black/20'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 3 }).map((_, weekIdx) => {
                      const wStart = addWeeks(weekStart, weekIdx);
                      const wEnd = addDays(wStart, 6);
                      const todayIdx = (() => {
                        const today = startOfDay(new Date());
                        const diff = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                        return Math.floor(diff / 7);
                      })();
                      const isActive = weekIdx === Math.max(0, Math.min(2, todayIdx));
                      return (
                        <div
                          key={weekIdx}
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
      </div>

      {/* Modals */}
      {showModal && <OrderModal onClose={() => setShowModal(false)} />}
      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

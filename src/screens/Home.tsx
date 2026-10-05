import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Order } from '../types';
import { format, startOfWeek, addWeeks, isBefore, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Plus, ChevronLeft, ChevronRight, Sun } from 'lucide-react';
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
  const weekEnd = addWeeks(weekStart, 3); // Show 3 weeks

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
      {/* Main workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-start justify-between px-8 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Sun size={18} className="text-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold text-navy leading-tight">{greeting}, Josy</h1>
              <p className="text-[13px] text-slate-text mt-0.5">
                Hoy tienes <span className="font-medium text-navy">{todayOrders.length} órdenes programadas</span> y <span className="font-medium text-red-500">{overdueOrders.length} atrasadas</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[13px] font-medium text-navy">{format(today, 'EEEE', { locale: es })}</div>
              <div className="text-[12px] text-slate-text">{format(today, "d 'de' MMMM, yyyy", { locale: es })}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text" />
                <input
                  type="text"
                  placeholder="Buscar paciente, orden..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field pl-8 w-[180px] h-[34px] text-[12px]"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-primary flex items-center justify-center text-white text-[12px] font-semibold">J</div>
            </div>
          </div>
        </header>

        {/* Quick actions */}
        <div className="px-8 pb-3 flex-shrink-0">
          <div className="flex gap-2.5">
            {[
              { label: 'Nueva orden', sub: 'Crear orden de trabajo', icon: '📋', action: () => setShowModal(true), bg: 'bg-pastel-blue' },
              { label: 'Pacientes', sub: 'Ver registro', icon: '👤', action: () => {}, bg: 'bg-pastel-mint' },
              { label: 'Captura 3D', sub: 'Escanear y exportar', icon: '📦', action: () => {}, bg: 'bg-pastel-lavender' },
              { label: 'Inventario', sub: 'Materiales y stock', icon: '📦', action: () => {}, bg: 'bg-pastel-yellow' },
              { label: 'Horario', sub: 'Ver turnos del equipo', icon: '📅', action: () => {}, bg: 'bg-pastel-peach' },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex-1 card-sm px-3 py-2.5 flex items-center gap-2.5 hover:shadow-md transition-shadow text-left"
              >
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center text-[14px]`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-navy truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-text truncate">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline section */}
        <div className="flex-1 px-8 pb-4 overflow-hidden flex flex-col">
          <div className="card flex-1 flex flex-col overflow-hidden">
            {/* Timeline header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-semibold text-navy">Órdenes</h2>
                <div className="flex gap-1">
                  {['Semana', 'Mes', 'Año'].map(v => (
                    <button key={v} className={`pill ${v === 'Semana' ? 'pill-active' : 'pill-inactive'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setWeekOffset(w => w - 1)} className="btn-ghost p-1.5"><ChevronLeft size={16} /></button>
                <button onClick={() => setWeekOffset(0)} className="btn-ghost text-[12px]">Hoy</button>
                <button onClick={() => setWeekOffset(w => w + 1)} className="btn-ghost p-1.5"><ChevronRight size={16} /></button>
                <span className="text-[12px] text-slate-text ml-2">
                  {format(weekStart, 'd MMM', { locale: es })} — {format(addWeeks(weekEnd, 0), 'd MMM yyyy', { locale: es })}
                </span>
                <button onClick={() => setShowModal(true)} className="btn-primary ml-2 flex items-center gap-1">
                  <Plus size={14} /> Nueva
                </button>
              </div>
            </div>

            {/* Timeline body */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-5 py-4">
              <Timeline
                orders={filteredOrders}
                weekStart={weekStart}
                weekEnd={weekEnd}
                onSelectOrder={setSelectedOrder}
              />
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="px-8 pb-4 flex-shrink-0">
          <RecentOrders orders={state.orders} onSelectOrder={setSelectedOrder} />
        </div>
      </div>

      {/* Utility Rail */}
      <UtilityRail />

      {/* Modals */}
      {showModal && <OrderModal onClose={() => setShowModal(false)} />}
      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

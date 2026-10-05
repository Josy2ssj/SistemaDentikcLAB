import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { isBefore, isSameDay, parseISO } from 'date-fns';
import { Play, Pause, SkipBack, SkipForward, Heart, Check, Trash2, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export default function UtilityRail() {
  const { state, toggleTask, addTask, deleteTask } = useApp();
  const [playing, setPlaying] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = state.orders.filter(o => isSameDay(parseISO(o.requestedDate), today));
  const overdueOrders = state.orders.filter(o => o.status !== 'Entregada' && isBefore(parseISO(o.requestedDate), today));
  const inProgress = state.orders.filter(o => o.status === 'En proceso');
  const ready = state.orders.filter(o => o.status === 'Lista');

  // Treatment type counts
  const typeCounts = state.orders.reduce((acc, o) => {
    acc[o.treatmentType] = (acc[o.treatmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalOrders = state.orders.length;

  // Donut chart data
  const typeColors: Record<string, string> = {
    'Alineadores': '#3b82f6',
    'Retenedores': '#10b981',
    'Modelos': '#f59e0b',
    'Guías quirúrgicas': '#8b5cf6',
    'Guardas': '#ec4899',
    'Otros': '#94a3b8',
  };

  const donutSegments = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    color: typeColors[type] || '#94a3b8',
    pct: (count / totalOrders) * 100,
  }));

  // Calculate SVG donut
  let cumulativePct = 0;
  const donutPaths = donutSegments.map(seg => {
    const startAngle = (cumulativePct / 100) * 360;
    cumulativePct += seg.pct;
    const endAngle = (cumulativePct / 100) * 360;
    return { ...seg, startAngle, endAngle };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask({ id: uuid(), title: newTaskTitle, time: '—', done: false });
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <aside className="w-[360px] min-w-[360px] border-l border-black/5 bg-white/30 overflow-y-auto overscroll-contain scrollbar-thin p-4 space-y-3">
      {/* Music Widget */}
      <div className="card-sm p-3">
        <div className="flex items-center gap-3">
          {/* Album artwork - CSS gradient */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-200 via-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-white/60 backdrop-blur-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-navy truncate">Focus Flow</div>
            <div className="text-[10px] text-slate-text">Lo-fi Beats</div>
          </div>
          <button className="text-slate-text hover:text-red-400 transition-colors flex-shrink-0">
            <Heart size={14} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <button className="text-slate-text hover:text-navy transition-colors"><SkipBack size={14} /></button>
          <button
            onClick={() => setPlaying(!playing)}
            className="w-9 h-9 rounded-full bg-blue-primary text-white flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <button className="text-slate-text hover:text-navy transition-colors"><SkipForward size={14} /></button>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-[9px] text-slate-text">1:24</span>
          <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-primary/40 rounded-full transition-all" style={{ width: playing ? '35%' : '0%' }} />
          </div>
          <span className="text-[9px] text-slate-text">3:45</span>
        </div>
      </div>

      {/* Today summary */}
      <div className="card-sm p-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[12px] font-semibold text-navy tracking-tight">Resumen de hoy</h3>
          <button className="text-[10px] text-blue-primary font-medium">Ver agenda →</button>
        </div>
        <div className="space-y-1">
          {[
            { label: 'Órdenes del día', value: todayOrders.length, icon: Calendar, color: 'text-navy' },
            { label: 'Atrasadas', value: overdueOrders.length, icon: AlertCircle, color: 'text-red-500' },
            { label: 'En proceso', value: inProgress.length, icon: Clock, color: 'text-blue-primary' },
            { label: 'Listas', value: ready.length, icon: CheckCircle2, color: 'text-emerald-600' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-2 py-1.5">
              <row.icon size={13} className="text-slate-text flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[11.5px] text-slate-text flex-1">{row.label}</span>
              <span className={`text-[13px] font-semibold tabular-nums ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Work types donut */}
      <div className="card-sm p-3">
        <h3 className="text-[12px] font-semibold text-navy mb-3 tracking-tight">Tipos de trabajos</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-[90px] h-[90px] flex-shrink-0">
            <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
              {donutPaths.map((seg, i) => (
                <path
                  key={i}
                  d={describeArc(45, 45, 34, seg.startAngle, seg.endAngle - 0.5)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={11}
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[18px] font-bold text-navy leading-none">{totalOrders}</span>
              <span className="text-[9px] text-slate-text mt-0.5">Órdenes</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {donutSegments.map(seg => (
              <div key={seg.type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                <span className="text-[10px] text-slate-text flex-1 truncate">{seg.type}</span>
                <span className="text-[10px] font-semibold text-navy tabular-nums">{seg.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="card-sm p-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[12px] font-semibold text-navy tracking-tight">Tareas del día</h3>
          <button onClick={() => setShowAddTask(!showAddTask)} className="text-[10px] text-blue-primary font-medium">
            {showAddTask ? 'Cancelar' : '+ Agregar'}
          </button>
        </div>

        {showAddTask && (
          <div className="flex gap-1.5 mb-2.5">
            <input
              className="input-field text-[11px] flex-1 h-[30px]"
              placeholder="Nueva tarea..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <button onClick={handleAddTask} className="btn-primary text-[10px] px-2.5 h-[30px]">Añadir</button>
          </div>
        )}

        <div className="space-y-0.5">
          {state.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 py-1.5 group">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-blue-primary'
                }`}
              >
                {task.done && <Check size={10} className="text-white" strokeWidth={2.5} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-[11.5px] leading-tight ${task.done ? 'line-through text-slate-text/60' : 'text-navy'}`}>
                  {task.title}
                </div>
                {task.subtitle && <div className="text-[10px] text-slate-text leading-tight">{task.subtitle}</div>}
              </div>
              <span className="text-[10px] text-slate-text tabular-nums flex-shrink-0">{task.time}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-text hover:text-red-500 transition-all flex-shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

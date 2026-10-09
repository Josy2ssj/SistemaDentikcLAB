import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ScheduleEntry, ShiftType } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const shiftColors: Record<ShiftType, string> = {
  'Matutino': 'bg-pastel-blue text-blue-700',
  'Vespertino': 'bg-pastel-lavender text-purple-700',
  'Extra': 'bg-pastel-yellow text-amber-700',
  'Libre': 'bg-gray-100 text-gray-500',
};

const people = ['Josy', 'Yael'];
const shifts: ShiftType[] = ['Matutino', 'Vespertino', 'Extra', 'Libre'];

export default function Schedule() {
  const { state, setSchedule } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editPerson, setEditPerson] = useState('Josy');
  const [editShift, setEditShift] = useState<ShiftType>('Matutino');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start to align with week
  const startPad = ((getDay(monthStart) + 6) % 7) as number;
  const nulls: (Date | null)[] = Array.from({ length: startPad }, () => null);
  const paddedDays: (Date | null)[] = [...nulls, ...days];

  const getEntriesForDate = (dateStr: string) => {
    return state.schedule.filter(e => e.date === dateStr);
  };

  const handleAssignShift = () => {
    if (!selectedDate) return;
    const existing = state.schedule.filter(e => !(e.date === selectedDate && e.person === editPerson));
    const newEntry: ScheduleEntry = { date: selectedDate, person: editPerson, shift: editShift };
    setSchedule([...existing, newEntry]);
    setSelectedDate(null);
  };

  const handleRemoveShift = (person: string) => {
    if (!selectedDate) return;
    setSchedule(state.schedule.filter(e => !(e.date === selectedDate && e.person === person)));
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Calendar main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-navy">Horario</h1>
            <p className="text-[13px] text-slate-text mt-0.5">Gestión de turnos del equipo</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-ghost p-1.5"><ChevronLeft size={16} /></button>
            <span className="text-[14px] font-medium text-navy min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-ghost p-1.5"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="flex-1 px-8 pb-4 overflow-auto">
          <div className="card p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="text-center text-[11px] font-medium text-slate-text py-1">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, idx) => {
                if (!day) return <div key={`pad-${idx}`} className="h-[72px]" />;
                const dateStr = format(day, 'yyyy-MM-dd');
                const entries = getEntriesForDate(dateStr);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const todayDate = isToday(day);

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-[72px] rounded-xl p-1.5 text-left transition-all border ${
                      selectedDate === dateStr
                        ? 'border-blue-primary/30 bg-blue-50/50'
                        : 'border-transparent hover:bg-black/[0.02]'
                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div className={`text-[11px] font-medium mb-1 ${todayDate ? 'text-blue-primary' : 'text-navy'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {entries.map(e => (
                        <div key={e.person} className={`text-[9px] px-1.5 py-0.5 rounded-md truncate ${shiftColors[e.shift]}`}>
                          {e.person}: {e.shift}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-[300px] min-w-[300px] border-l border-black/5 bg-white/40 p-4 overflow-y-auto">
        {selectedDate ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-navy">
                {format(new Date(selectedDate + 'T12:00:00'), "d 'de' MMMM", { locale: es })}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="btn-ghost p-1"><X size={14} /></button>
            </div>

            {/* Current assignments */}
            <div className="space-y-2">
              <div className="text-[11px] font-medium text-slate-text">Asignaciones</div>
              {getEntriesForDate(selectedDate).map(e => (
                <div key={e.person} className="card-sm px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-medium text-navy">{e.person}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${shiftColors[e.shift]}`}>{e.shift}</span>
                  </div>
                  <button onClick={() => handleRemoveShift(e.person)} className="text-slate-text hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {getEntriesForDate(selectedDate).length === 0 && (
                <div className="text-[12px] text-slate-text italic">Sin asignaciones</div>
              )}
            </div>

            {/* Add shift form */}
            <div className="space-y-2 pt-2 border-t border-black/5">
              <div className="text-[11px] font-medium text-slate-text">Asignar turno</div>
              <select className="input-field text-[12px] h-[32px]" value={editPerson} onChange={e => setEditPerson(e.target.value)}>
                {people.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="flex gap-1 flex-wrap">
                {shifts.map(s => (
                  <button
                    key={s}
                    onClick={() => setEditShift(s)}
                    className={`pill text-[11px] ${editShift === s ? 'pill-active' : 'pill-inactive'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={handleAssignShift} className="btn-primary w-full text-[12px]">
                Asignar
              </button>
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-black/5">
              <div className="text-[11px] font-medium text-slate-text mb-2">Simbología</div>
              <div className="space-y-1.5">
                {shifts.map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${shiftColors[s]}`} />
                    <span className="text-[11px] text-navy">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-[13px] text-slate-text">Selecciona un día para asignar turnos</div>
          </div>
        )}
      </aside>
    </div>
  );
}

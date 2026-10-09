import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { InventoryItem } from '../types';
import { Search, Plus, X, Package, AlertTriangle } from 'lucide-react';
import { v4 as uuid } from 'uuid';

const categories = ['Materiales', 'Acabado', 'Impresión 3D', 'Alineadores', 'Limpieza'];

export default function Inventory() {
  const { state, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    name: '', category: 'Materiales', stock: 0, unit: '', minimum: 0, notes: ''
  });

  const filtered = useMemo(() => {
    let result = state.inventory;
    if (categoryFilter) result = result.filter(i => i.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return result;
  }, [state.inventory, categoryFilter, search]);

  const lowStock = state.inventory.filter(i => i.stock <= i.minimum);
  const uniqueCategories = [...new Set(state.inventory.map(i => i.category))];

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({ name: item.name, category: item.category, stock: item.stock, unit: item.unit, minimum: item.minimum, notes: item.notes });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingItem) {
      updateInventoryItem({ ...editingItem, ...form });
    } else {
      addInventoryItem({ id: uuid(), ...form });
    }
    setShowForm(false);
    setEditingItem(null);
    setForm({ name: '', category: 'Materiales', stock: 0, unit: '', minimum: 0, notes: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este material?')) deleteInventoryItem(id);
  };

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-navy">Inventario</h1>
            <p className="text-[13px] text-slate-text mt-0.5">Materiales y stock del laboratorio</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setForm({ name: '', category: 'Materiales', stock: 0, unit: '', minimum: 0, notes: '' }); setShowForm(true); }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> Nuevo material
          </button>
        </div>

        {/* Stats */}
        <div className="px-8 pb-3 flex gap-3">
          {[
            { label: 'Total materiales', value: state.inventory.length, icon: Package, color: 'bg-pastel-blue' },
            { label: 'Categorías', value: uniqueCategories.length, icon: Package, color: 'bg-pastel-mint' },
            { label: 'Stock bajo', value: lowStock.length, icon: AlertTriangle, color: 'bg-pastel-coral' },
          ].map(s => (
            <div key={s.label} className="card-sm px-3 py-2.5 flex items-center gap-2.5 flex-1">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon size={14} className="text-navy" />
              </div>
              <div>
                <div className="text-[16px] font-semibold text-navy">{s.value}</div>
                <div className="text-[10px] text-slate-text">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="px-8 pb-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text" />
            <input className="input-field pl-8 h-[34px] text-[12px]" placeholder="Buscar material..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1">
            <button onClick={() => setCategoryFilter(null)} className={`pill text-[11px] ${!categoryFilter ? 'pill-active' : 'pill-inactive'}`}>Todos</button>
            {categories.map(c => (
              <button key={c} onClick={() => setCategoryFilter(categoryFilter === c ? null : c)} className={`pill text-[11px] ${categoryFilter === c ? 'pill-active' : 'pill-inactive'}`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 px-8 pb-4 overflow-auto">
          <div className="grid grid-cols-4 gap-2.5">
            {filtered.map(item => {
              const isLow = item.stock <= item.minimum;
              return (
                <div key={item.id} className="card-sm p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="text-[12px] font-medium text-navy leading-tight">{item.name}</div>
                    {isLow && <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-text mb-2">{item.category}</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[18px] font-bold ${isLow ? 'text-red-500' : 'text-navy'}`}>{item.stock}</span>
                    <span className="text-[11px] text-slate-text">{item.unit}</span>
                  </div>
                  {isLow && <div className="text-[10px] text-red-500 mt-0.5">Mínimo: {item.minimum}</div>}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => openEdit(item)} className="btn-ghost text-[10px] px-2 py-0.5">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="btn-ghost text-[10px] px-2 py-0.5 text-red-500">Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="card w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
              <h3 className="text-[14px] font-semibold text-navy">{editingItem ? 'Editar material' : 'Nuevo material'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-text mb-1 block">Nombre</label>
                <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del material" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-text mb-1 block">Categoría</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-text mb-1 block">Unidad</label>
                  <input className="input-field" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="pcs, L, kg..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-text mb-1 block">Stock</label>
                  <input type="number" className="input-field" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-text mb-1 block">Mínimo</label>
                  <input type="number" className="input-field" value={form.minimum} onChange={e => setForm(f => ({ ...f, minimum: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-text mb-1 block">Notas</label>
                <textarea className="input-field resize-none h-[50px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-black/5">
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
              <button onClick={handleSave} className="btn-primary">{editingItem ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

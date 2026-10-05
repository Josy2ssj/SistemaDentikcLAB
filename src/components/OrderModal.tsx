import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Order, TreatmentType, Arch, OrderStatus } from '../types';
import { X } from 'lucide-react';

interface OrderModalProps {
  order?: Order;
  onClose: () => void;
}

const treatmentTypes: TreatmentType[] = ['Alineadores', 'Retenedores', 'Modelos', 'Guías quirúrgicas', 'Guardas', 'Otros'];
const arches: Arch[] = ['Superior', 'Inferior', 'Ambas'];
const statuses: OrderStatus[] = ['Pendiente', 'En proceso', 'Lista', 'Entregada'];

export default function OrderModal({ order, onClose }: OrderModalProps) {
  const { addOrder, updateOrder } = useApp();
  const isEdit = !!order;

  const [form, setForm] = useState({
    patientName: order?.patientName || '',
    clinic: order?.clinic || '',
    doctor: order?.doctor || '',
    treatmentType: order?.treatmentType || 'Alineadores' as TreatmentType,
    treatmentDetails: order?.treatmentDetails || '',
    arch: order?.arch || 'Superior' as Arch,
    base: order?.base || 'Estándar',
    notes: order?.notes || '',
    requestedDate: order?.requestedDate || new Date().toISOString().split('T')[0],
    deliveryDate: order?.deliveryDate || '',
    status: order?.status || 'Pendiente' as OrderStatus,
    responsible: order?.responsible || 'Josy',
    deliveredBy: order?.deliveredBy || '',
    alignerQuantity: order?.alignerQuantity || 0,
    alignerRange: order?.alignerRange || '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!form.patientName.trim()) errs.push('Nombre del paciente');
    if (!form.requestedDate) errs.push('Fecha solicitada');
    if (errs.length > 0) { setErrors(errs); return; }

    const today = new Date().toISOString().split('T')[0];
    const orderData: Order = {
      id: order?.id || `ORD-${String(Date.now()).slice(-3)}`,
      patientName: form.patientName,
      clinic: form.clinic,
      doctor: form.doctor,
      treatmentType: form.treatmentType,
      treatmentDetails: form.treatmentDetails,
      arch: form.arch,
      base: form.base,
      files: order?.files || [],
      notes: form.notes,
      createdAt: order?.createdAt || today,
      requestedDate: form.requestedDate,
      deliveryDate: form.deliveryDate || form.requestedDate,
      status: form.status,
      responsible: form.responsible,
      deliveredBy: form.deliveredBy,
      alignerQuantity: form.treatmentType === 'Alineadores' ? form.alignerQuantity : undefined,
      alignerRange: form.treatmentType === 'Alineadores' ? form.alignerRange : undefined,
    };

    if (isEdit) {
      updateOrder(orderData);
    } else {
      addOrder(orderData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <h2 className="text-[15px] font-semibold text-navy">{isEdit ? 'Editar orden' : 'Nueva orden'}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>

        {errors.length > 0 && (
          <div className="mx-5 mt-3 px-3 py-2 bg-pastel-coral/50 rounded-lg text-[12px] text-red-700">
            Campos requeridos: {errors.join(', ')}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Patient info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Paciente *</label>
              <input className="input-field" value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} placeholder="Nombre completo" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Clínica</label>
              <input className="input-field" value={form.clinic} onChange={e => setForm(f => ({ ...f, clinic: e.target.value }))} placeholder="Nombre clínica" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Doctor</label>
              <input className="input-field" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} placeholder="Dr./Dra." />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Responsable</label>
              <select className="input-field" value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}>
                <option>Josy</option>
                <option>Yael</option>
              </select>
            </div>
          </div>

          {/* Treatment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Tratamiento *</label>
              <select className="input-field" value={form.treatmentType} onChange={e => setForm(f => ({ ...f, treatmentType: e.target.value as TreatmentType }))}>
                {treatmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Arcada</label>
              <select className="input-field" value={form.arch} onChange={e => setForm(f => ({ ...f, arch: e.target.value as Arch }))}>
                {arches.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {form.treatmentType === 'Alineadores' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-text mb-1 block">Cantidad</label>
                <input type="number" className="input-field" value={form.alignerQuantity} onChange={e => setForm(f => ({ ...f, alignerQuantity: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-text mb-1 block">Rango</label>
                <input className="input-field" value={form.alignerRange} onChange={e => setForm(f => ({ ...f, alignerRange: e.target.value }))} placeholder="1-28" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-slate-text mb-1 block">Detalles</label>
            <input className="input-field" value={form.treatmentDetails} onChange={e => setForm(f => ({ ...f, treatmentDetails: e.target.value }))} placeholder="Detalles del tratamiento" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Base/Zócalo</label>
              <select className="input-field" value={form.base} onChange={e => setForm(f => ({ ...f, base: e.target.value }))}>
                <option>Estándar</option>
                <option>Premium</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Estado</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as OrderStatus }))}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Fecha solicitada *</label>
              <input type="date" className="input-field" value={form.requestedDate} onChange={e => setForm(f => ({ ...f, requestedDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-text mb-1 block">Fecha de entrega</label>
              <input type="date" className="input-field" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-text mb-1 block">Notas</label>
            <textarea className="input-field resize-none h-[60px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas adicionales..." />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-black/5">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={handleSubmit} className="btn-primary">{isEdit ? 'Guardar cambios' : 'Crear orden'}</button>
        </div>
      </div>
    </div>
  );
}

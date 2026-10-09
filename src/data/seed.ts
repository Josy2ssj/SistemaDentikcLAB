import { AppState } from '../types';

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

export const seedData: AppState = {
  orders: [
    {
      id: 'ORD-001', patientName: 'María López', clinic: 'Dental Plus', doctor: 'Dr. Ramírez',
      treatmentType: 'Alineadores', treatmentDetails: 'Tratamiento completo fase 1', arch: 'Ambas',
      base: 'Estándar', files: [], notes: 'Paciente con apiñamiento severo',
      createdAt: d(-10), requestedDate: d(2), deliveryDate: d(5), status: 'En proceso',
      responsible: 'Josy', deliveredBy: '', alignerQuantity: 28, alignerRange: '1-28'
    },
    {
      id: 'ORD-002', patientName: 'Carlos Mendoza', clinic: 'Sonríe Dental', doctor: 'Dra. Vega',
      treatmentType: 'Retenedores', treatmentDetails: 'Retenedor fijo inferior', arch: 'Inferior',
      base: 'Premium', files: [], notes: '',
      createdAt: d(-8), requestedDate: d(-2), deliveryDate: d(0), status: 'Pendiente',
      responsible: 'Yael', deliveredBy: ''
    },
    {
      id: 'ORD-003', patientName: 'Ana García', clinic: 'Dental Plus', doctor: 'Dr. Ramírez',
      treatmentType: 'Modelos', treatmentDetails: 'Modelos de estudio para planificación', arch: 'Ambas',
      base: 'Estándar', files: [], notes: '',
      createdAt: d(-5), requestedDate: d(3), deliveryDate: d(6), status: 'Pendiente',
      responsible: 'Josy', deliveredBy: ''
    },
    {
      id: 'ORD-004', patientName: 'Roberto Sánchez', clinic: 'Clínica Central', doctor: 'Dra. Torres',
      treatmentType: 'Guardas', treatmentDetails: 'Guarda oclusal superior', arch: 'Superior',
      base: 'Premium', files: [], notes: 'Bruxismo severo',
      createdAt: d(-12), requestedDate: d(-3), deliveryDate: d(-1), status: 'En proceso',
      responsible: 'Josy', deliveredBy: ''
    },
    {
      id: 'ORD-005', patientName: 'Laura Jiménez', clinic: 'Sonríe Dental', doctor: 'Dra. Vega',
      treatmentType: 'Guías quirúrgicas', treatmentDetails: 'Guía para implante #36', arch: 'Inferior',
      base: 'Estándar', files: [], notes: '',
      createdAt: d(-7), requestedDate: d(1), deliveryDate: d(4), status: 'En proceso',
      responsible: 'Yael', deliveredBy: ''
    },
    {
      id: 'ORD-006', patientName: 'Pedro Herrera', clinic: 'Dental Plus', doctor: 'Dr. Ramírez',
      treatmentType: 'Alineadores', treatmentDetails: 'Retreatment fase 2', arch: 'Superior',
      base: 'Premium', files: [], notes: '',
      createdAt: d(-3), requestedDate: d(5), deliveryDate: d(9), status: 'Pendiente',
      responsible: 'Josy', deliveredBy: '', alignerQuantity: 14, alignerRange: '29-42'
    },
    {
      id: 'ORD-007', patientName: 'Sofía Morales', clinic: 'Clínica Central', doctor: 'Dra. Torres',
      treatmentType: 'Retenedores', treatmentDetails: 'Retenedor removible', arch: 'Superior',
      base: 'Estándar', files: [], notes: '',
      createdAt: d(-15), requestedDate: d(-5), deliveryDate: d(-3), status: 'Entregada',
      responsible: 'Yael', deliveredBy: 'Yael'
    },
    {
      id: 'ORD-008', patientName: 'Diego Fernández', clinic: 'Dental Plus', doctor: 'Dr. Ramírez',
      treatmentType: 'Modelos', treatmentDetails: 'Modelo para encerado', arch: 'Ambas',
      base: 'Estándar', files: [], notes: '',
      createdAt: d(-20), requestedDate: d(-14), deliveryDate: d(-12), status: 'Entregada',
      responsible: 'Josy', deliveredBy: 'Josy'
    },
    {
      id: 'ORD-009', patientName: 'Valentina Ruiz', clinic: 'Sonríe Dental', doctor: 'Dra. Vega',
      treatmentType: 'Alineadores', treatmentDetails: 'Fase inicial', arch: 'Ambas',
      base: 'Premium', files: [], notes: 'Paciente nueva',
      createdAt: d(-1), requestedDate: d(7), deliveryDate: d(12), status: 'Pendiente',
      responsible: 'Josy', deliveredBy: '', alignerQuantity: 20, alignerRange: '1-20'
    },
    {
      id: 'ORD-010', patientName: 'Andrés Castro', clinic: 'Clínica Central', doctor: 'Dra. Torres',
      treatmentType: 'Guardas', treatmentDetails: 'Guarda deportiva', arch: 'Ambas',
      base: 'Premium', files: [], notes: '',
      createdAt: d(-6), requestedDate: d(2), deliveryDate: d(5), status: 'Lista',
      responsible: 'Yael', deliveredBy: ''
    },
    {
      id: 'ORD-011', patientName: 'Camila Ortiz', clinic: 'Dental Plus', doctor: 'Dr. Ramírez',
      treatmentType: 'Guías quirúrgicas', treatmentDetails: 'Guía para 2 implantes', arch: 'Inferior',
      base: 'Estándar', files: [], notes: 'Cirugía programada próximo viernes',
      createdAt: d(-4), requestedDate: d(2), deliveryDate: d(4), status: 'En proceso',
      responsible: 'Josy', deliveredBy: ''
    },
    {
      id: 'ORD-012', patientName: 'Fernando Luna', clinic: 'Sonríe Dental', doctor: 'Dra. Vega',
      treatmentType: 'Otros', treatmentDetails: 'Férula de blanqueamiento', arch: 'Ambas',
      base: 'Estándar', files: [], notes: '',
      createdAt: d(-9), requestedDate: d(-4), deliveryDate: d(-2), status: 'Entregada',
      responsible: 'Yael', deliveredBy: 'Yael'
    },
    {
      id: 'ORD-013', patientName: 'Isabella Navarro', clinic: 'Clínica Central', doctor: 'Dra. Torres',
      treatmentType: 'Alineadores', treatmentDetails: 'Tratamiento completo', arch: 'Ambas',
      base: 'Premium', files: [], notes: '',
      createdAt: d(-2), requestedDate: d(10), deliveryDate: d(16), status: 'Pendiente',
      responsible: 'Josy', deliveredBy: '', alignerQuantity: 36, alignerRange: '1-36'
    },
    {
      id: 'ORD-014', patientName: 'Miguel Ángel Ríos', clinic: 'Dental Plus', doctor: 'Dr. Ramírez',
      treatmentType: 'Retenedores', treatmentDetails: 'Retenedor Essix', arch: 'Ambas',
      base: 'Estándar', files: [], notes: '',
      createdAt: d(-11), requestedDate: d(-6), deliveryDate: d(-4), status: 'Entregada',
      responsible: 'Josy', deliveredBy: 'Josy'
    },
  ],
  tasks: [
    { id: 't1', title: 'Revisar escáner de María López', subtitle: 'Alineadores fase 1', time: '09:00', done: false, color: 'blue' },
    { id: 't2', title: 'Imprimir guía quirúrgica Camila', subtitle: 'Cirugía viernes', time: '10:30', done: false, color: 'orange' },
    { id: 't3', title: 'Entregar guarda a Andrés', subtitle: 'Clínica Central', time: '12:00', done: true, color: 'green' },
    { id: 't4', title: 'Calibrar impresora 3D', subtitle: 'Mantenimiento semanal', time: '14:00', done: false, color: 'purple' },
    { id: 't5', title: 'Reunión con Dr. Ramírez', subtitle: 'Nuevos casos', time: '16:00', done: false, color: 'blue' },
  ],
  inventory: [
    { id: 'inv1', name: 'Resina Aleric', category: 'Alineadores', stock: 12, unit: 'L', minimum: 5, notes: '' },
    { id: 'inv2', name: 'Filamento PLA', category: 'Impresión 3D', stock: 3, unit: 'kg', minimum: 5, notes: 'Pedir pronto' },
    { id: 'inv3', name: 'Papel lija 400', category: 'Acabado', stock: 50, unit: 'pcs', minimum: 20, notes: '' },
    { id: 'inv4', name: 'Alginato', category: 'Materiales', stock: 8, unit: 'bolsas', minimum: 10, notes: 'Stock bajo' },
    { id: 'inv5', name: 'Solución desinfectante', category: 'Limpieza', stock: 4, unit: 'L', minimum: 2, notes: '' },
    { id: 'inv6', name: 'Resina modelo', category: 'Impresión 3D', stock: 6, unit: 'L', minimum: 3, notes: '' },
    { id: 'inv7', name: 'Wire ortodóntico', category: 'Materiales', stock: 15, unit: 'm', minimum: 5, notes: '' },
    { id: 'inv8', name: 'Pasta de pulido', category: 'Acabado', stock: 2, unit: 'tubos', minimum: 3, notes: 'Reordenar' },
    { id: 'inv9', name: 'Elásticos clase II', category: 'Alineadores', stock: 200, unit: 'pcs', minimum: 100, notes: '' },
    { id: 'inv10', name: 'Isopropanol', category: 'Limpieza', stock: 10, unit: 'L', minimum: 5, notes: '' },
  ],
  schedule: [
    { date: d(0), person: 'Josy', shift: 'Matutino' },
    { date: d(0), person: 'Yael', shift: 'Vespertino' },
    { date: d(1), person: 'Josy', shift: 'Matutino' },
    { date: d(1), person: 'Yael', shift: 'Matutino' },
    { date: d(2), person: 'Josy', shift: 'Vespertino' },
    { date: d(2), person: 'Yael', shift: 'Libre' },
    { date: d(3), person: 'Josy', shift: 'Matutino' },
    { date: d(3), person: 'Yael', shift: 'Extra' },
  ],
  notifications: [
    { id: 'n1', title: 'Nueva orden', message: 'María López ha creado una orden de Alineadores', type: 'info', read: false, createdAt: d(-1) },
    { id: 'n2', title: 'Orden atrasada', message: 'La orden de Carlos Mendoza está atrasada', type: 'warning', read: false, createdAt: d(-2) },
    { id: 'n3', title: 'Orden completada', message: 'Sofía Morales ha completado su tratamiento', type: 'success', read: true, createdAt: d(-3) },
    { id: 'n4', title: 'Stock bajo', message: 'El stock de Resina Aleric está bajo', type: 'warning', read: false, createdAt: d(-1) },
  ],
};

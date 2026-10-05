export type TreatmentType =
  | 'Alineadores'
  | 'Retenedores'
  | 'Modelos'
  | 'Guías quirúrgicas'
  | 'Guardas'
  | 'Otros';

export type OrderStatus = 'Pendiente' | 'En proceso' | 'Lista' | 'Entregada';

export type Arch = 'Superior' | 'Inferior' | 'Ambas';

export interface Order {
  id: string;
  patientName: string;
  clinic: string;
  doctor: string;
  treatmentType: TreatmentType;
  treatmentDetails: string;
  arch: Arch;
  base: string;
  files: string[];
  notes: string;
  createdAt: string;
  requestedDate: string;
  deliveryDate: string;
  status: OrderStatus;
  responsible: string;
  deliveredBy: string;
  alignerQuantity?: number;
  alignerRange?: string;
}

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  time: string;
  done: boolean;
  color?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minimum: number;
  notes: string;
}

export type ShiftType = 'Matutino' | 'Vespertino' | 'Extra' | 'Libre';

export interface ScheduleEntry {
  date: string;
  person: string;
  shift: ShiftType;
}

export interface AppState {
  orders: Order[];
  tasks: Task[];
  inventory: InventoryItem[];
  schedule: ScheduleEntry[];
}

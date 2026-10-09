# DLSy — DentiKC Lab System V5

## Qué es
Sistema de gestión para laboratorio dental. Control de órdenes, timeline visual, horarios, inventario y captura 3D.

## Módulos
- **Home** — Dashboard principal con Timeline de órdenes
- **Órdenes** — CRUD completo de órdenes de trabajo
- **Horario** — Calendario mensual con turnos del equipo
- **Inventario** — Control de materiales y stock
- **Captura 3D** — Carga y gestión de archivos STL/OBJ/PLY

## Arquitectura
```
src/
├── App.tsx              — Entry point + routing
├── index.css            — Design system + Tailwind
├── types/index.ts       — TypeScript interfaces
├── data/seed.ts         — Seed data (solo primera carga)
├── store/AppContext.tsx  — Estado global + localStorage
├── components/
│   ├── Shell.tsx         — Layout (sidebar + main)
│   ├── Timeline.tsx      — Timeline visual de órdenes
│   ├── OrderModal.tsx    — Crear/editar orden
│   ├── OrderDetail.tsx   — Detalle visual de orden
│   ├── RecentOrders.tsx  — Cards de órdenes recientes
│   └── UtilityRail.tsx   — Panel derecho (música, stats, tareas)
└── screens/
    ├── Home.tsx          — Pantalla principal
    ├── Orders.tsx        — Lista completa de órdenes
    ├── Schedule.tsx      — Calendario de turnos
    ├── Inventory.tsx     — Gestión de materiales
    └── Capture3D.tsx     — Carga de modelos 3D
```

## Estado actual
- Beta funcional con todas las pantallas navegables
- Timeline conectado a órdenes reales (requestedDate)
- CRUD completo de órdenes
- Persistencia localStorage
- Stats calculadas dinámicamente

## Comandos
```bash
npm install
npm run dev      # Desarrollo
npm run build    # Producción
```

## Store
- Context API + useReducer
- localStorage para persistencia
- Clave: `dlsy_v5_state`
- Seed data solo si no existe estado previo

## Timeline
- Eje horizontal basado en `requestedDate`
- 3 semanas visibles en modo Semana
- Ramas deterministas (sin Math.random)
- Baseline perfectamente recta
- Hover muestra tooltip con info de orden
- Click abre detalle completo

## Archivos críticos
- `src/store/AppContext.tsx` — Toda la lógica de datos
- `src/components/Timeline.tsx` — Visualización principal
- `src/screens/Home.tsx` — Composición del dashboard
- `src/data/seed.ts` — Datos iniciales

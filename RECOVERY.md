# RECOVERY — DLSy V5

## Setup rápido
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # dist/
```

## Estructura clave

| Archivo | Propósito |
|---------|-----------|
| `src/App.tsx` | Routing + providers |
| `src/store/AppContext.tsx` | Estado global (orders, tasks, inventory, schedule) |
| `src/types/index.ts` | Interfaces TypeScript |
| `src/data/seed.ts` | Datos iniciales (14 órdenes, tareas, inventario, turnos) |
| `src/components/Timeline.tsx` | Timeline visual — núcleo del producto |
| `src/components/Shell.tsx` | Layout: sidebar + workspace |
| `src/screens/Home.tsx` | Dashboard principal |
| `src/screens/Orders.tsx` | Lista/tabla de órdenes con filtros |
| `src/screens/Schedule.tsx` | Calendario mensual de turnos |
| `src/screens/Inventory.tsx` | Grid de materiales con CRUD |
| `src/screens/Capture3D.tsx` | Dropzone + archivos recientes |
| `src/components/OrderModal.tsx` | Formulario crear/editar orden |
| `src/components/OrderDetail.tsx` | Panel visual de detalle de orden |
| `src/components/UtilityRail.tsx` | Panel derecho: música, stats, tareas |
| `src/components/RecentOrders.tsx` | Cards de últimas 4 órdenes |

## Datos
- Persistencia: `localStorage` con key `dlsy_v5_state`
- Seed solo primera vez (si no hay datos guardados)
- Orden en Timeline se posiciona por `requestedDate`
- "Atrasada" se calcula: `requestedDate < today AND status !== 'Entregada'`

## Stack
- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- date-fns v2
- lucide-react (iconos)
- react-router-dom v6
- uuid

## Navegación
- `/` → Home (Timeline + widgets)
- `/orders` → Órdenes (tabla + filtros)
- `/schedule` → Horario (calendario)
- `/inventory` → Inventario (grid)
- `/capture` → Captura 3D (dropzone)

## Limitaciones conocidas
- Captura 3D: solo carga de archivos, sin visor 3D real
- Horario: funcionalidad básica (asignar/quitar turnos)
- Música: UI funcional sin audio real
- Mes/Año en Timeline: representaciones simples
- Sin drag & drop en Timeline

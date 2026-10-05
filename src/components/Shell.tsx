import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Calendar, Package, Box, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/orders', label: 'Órdenes', icon: ClipboardList },
  { path: '/schedule', label: 'Horario', icon: Calendar },
  { path: '/inventory', label: 'Inventario', icon: Package },
  { path: '/capture', label: 'Captura 3D', icon: Box },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="ambient-bg flex h-full relative">
      {/* Sidebar */}
      <aside className="relative z-10 w-[152px] min-w-[152px] flex flex-col border-r border-black/5 bg-white/60 backdrop-blur-sm">
        <div className="px-5 pt-6 pb-4">
          <div className="text-[15px] font-semibold text-navy tracking-tight">DentiKC</div>
          <div className="text-[11px] text-slate-text font-medium tracking-wider uppercase">LAB OS</div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? 'bg-white shadow-sm text-navy'
                    : 'text-slate-text hover:text-navy hover:bg-white/50'
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2 : 1.5} className={active ? 'text-blue-primary' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pb-4">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-text hover:text-navy hover:bg-white/50 transition-all">
            <Settings size={17} strokeWidth={1.5} />
            Configuración
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

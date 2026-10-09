import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Calendar, Package, Box, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/orders', label: 'Órdenes', icon: ClipboardList },
  { path: '/schedule', label: 'Horario', icon: Calendar },
  { path: '/inventory', label: 'Inventario', icon: Package },
  { path: '/capture', label: 'Captura 3D', icon: Box },
];

const SIDEBAR_KEY = 'dlsy_sidebar_collapsed';

export default function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  return (
    <div className="ambient-bg flex h-full relative">
      {/* Sidebar */}
      <aside
        className="relative z-10 flex flex-col border-r border-black/5 bg-white/60 backdrop-blur-sm overflow-hidden transition-[width,min-width] duration-250 ease-out"
        style={{ width: collapsed ? 72 : 152, minWidth: collapsed ? 72 : 152 }}
      >
        {/* Brand */}
        <div className={`pt-6 pb-4 transition-all duration-250 ease-out ${collapsed ? 'px-2 text-center' : 'px-5'}`}>
          <div className={`font-semibold text-navy tracking-tight transition-all duration-250 ${collapsed ? 'text-[18px]' : 'text-[15px]'}`}>
            {collapsed ? 'D' : 'DentiKC'}
          </div>
          {!collapsed && (
            <div className="text-[11px] text-slate-text font-medium tracking-wider uppercase">LAB OS</div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 transition-all duration-250 ease-out ${collapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                  } ${
                    active
                      ? 'bg-white shadow-sm text-navy'
                      : 'text-slate-text hover:text-navy hover:bg-white/50'
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2 : 1.5} className={active ? 'text-blue-primary flex-shrink-0' : 'flex-shrink-0'} />
                  {!collapsed && (
                    <span className="transition-opacity duration-200 whitespace-nowrap">{item.label}</span>
                  )}
                </button>
                {/* Tooltip en modo compacto */}
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-lg bg-navy text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Settings */}
        <div className={`pb-4 transition-all duration-250 ease-out ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className="relative group">
            <button 
              onClick={() => alert('Configuración - Próximamente disponible')}
              className={`w-full flex items-center gap-2.5 rounded-xl text-[13px] font-medium text-slate-text hover:text-navy hover:bg-white/50 transition-all ${
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            }`}>
              <Settings size={17} strokeWidth={1.5} className="flex-shrink-0" />
              {!collapsed && <span>Configuración</span>}
            </button>
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-lg bg-navy text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                Configuración
              </div>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-black/10 flex items-center justify-center text-slate-text hover:text-navy hover:border-black/20 transition-all shadow-sm opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 z-20"
          style={{ opacity: 0.7 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          aria-label={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

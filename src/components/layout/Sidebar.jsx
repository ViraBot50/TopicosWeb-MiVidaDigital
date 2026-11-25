import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Bell,
  Calculator,
  CheckSquare,
  UserRound,
  Settings,
  Wallet,
} from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Mis documentos',
    path: '/archivos',
    icon: FolderOpen,
  },
  {
    name: 'Recordatorios',
    path: '/recordatorios',
    icon: Bell,
  },
  {
    name: 'Calculadora',
    path: '/calculadora',
    icon: Calculator,
  },
  {
    name: 'Mis tareas',
    path: '/tareas',
    icon: CheckSquare,
  },
  {
    name: 'Información',
    path: '/informacion',
    icon: UserRound,
  },
];

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950">
      {/* Identidad de la aplicación */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
          <Wallet size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            MiVida Digital
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tu espacio personal
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menú principal
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Configuración */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <NavLink
          to="/configuracion"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
            }`
          }
        >
          <Settings size={19} />
          Configuración
        </NavLink>

        <p className="mt-4 px-3 text-xs text-slate-400">
          MiVida Digital © 2026
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;

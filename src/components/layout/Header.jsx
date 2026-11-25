import { useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/useAuth';
import { LogOut } from 'lucide-react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/archivos': 'Mis documentos',
  '/recordatorios': 'Recordatorios',
  '/calculadora': 'Calculadora',
  '/tareas': 'Mis tareas',
  '/informacion': 'Información',
  '/configuracion': 'Configuración',
};

function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { cerrarSesion } = useAuth();

  const title = pageTitles[location.pathname] || 'MiVida Digital';

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={21} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Gestiona tu información desde un solo lugar
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
        </button>

        <button
          onClick={() => cerrarSesion('local')}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>

        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 sm:flex dark:bg-emerald-500/20 dark:text-emerald-400">
          MV
        </div>
      </div>
    </header>
  );
}

export default Header;
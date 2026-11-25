import {
  Globe,
  GitBranch,
  MessageCircle,
  FolderOpen,
  CalendarDays,
  Calculator,
  ShieldCheck,
  Sun,
  Moon,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';

import { PROVEEDORES, urlLogin } from '../api/session';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../context/ThemeContext';
import Avisos from '../components/Avisos.jsx';
import { useAvisoDeUrl } from '../hooks/useAvisoDeUrl';

const PROVEEDORES_INFO = {
    google: {
    nombre: 'Google',
    icono: Globe,
    descripcion: 'Continuar con Google',
  },
  github: {
    nombre: 'GitHub',
    icono: GitBranch,
    descripcion: 'Continuar con GitHub',
  },
  discord: {
    nombre: 'Discord',
    icono: MessageCircle,
    descripcion: 'Continuar con Discord',
  },
};

function LoginPage() {
  const { aviso } = useAuth();
  const avisoUrl = useAvisoDeUrl();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-6 lg:p-8">

      {/* Elementos decorativos del fondo */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-500/10" />

      {/* Botón de tema */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:right-8 sm:top-8"
      >
        {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
      </button>

      {/* Contenedor principal */}
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 lg:min-h-[650px] lg:grid-cols-2">

        {/* Panel izquierdo: presentación */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#102F35] p-8 text-white sm:p-12 lg:p-14">

          {/* Decoración */}
          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-2xl" />

          {/* Logotipo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-950/20">
              <Wallet size={25} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                MiVida Digital
              </h1>
              <p className="text-xs text-emerald-100/70">
                Tu espacio personal
              </p>
            </div>
          </div>

          {/* Mensaje principal */}
          <div className="relative z-10 my-12 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ORGANIZA TU VIDA DIGITAL
            </span>

            <h2 className="mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Todo lo importante,
              <span className="block text-emerald-400">
                en un solo lugar.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Una plataforma diseñada para ayudarte a organizar tus
              documentos, administrar tus actividades y mantener tu
              información siempre a tu alcance.
            </p>

            {/* Funcionalidades */}
            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                  <FolderOpen size={21} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Documentos personales
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Administra tus archivos en un solo espacio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                  <CalendarDays size={21} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Tareas y recordatorios
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Organiza tus actividades y fechas importantes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                  <Calculator size={21} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Herramientas personales
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Consulta y administra información importante.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pie del panel */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
            <p className="text-xs text-slate-400">
              MiVida Digital © 2026
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-200/80">
              <ShieldCheck size={15} />
              Acceso seguro
            </div>
          </div>
        </section>

        {/* Panel derecho: inicio de sesión */}
        <section className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">

          <div className="mx-auto w-full max-w-md">

            <div className="mb-8">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                BIENVENIDO DE NUEVO
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Inicia sesión
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Accede a tu espacio personal y continúa organizando
                tu vida digital.
              </p>
            </div>

            {/* Avisos del sistema */}
            <div className="mb-5">
              <Avisos
                mensaje={aviso || (!avisoUrl?.esError ? avisoUrl?.mensaje : '')}
                error={avisoUrl?.esError ? avisoUrl.mensaje : ''}
              />
            </div>

            {/* Proveedores OAuth */}
            <div className="space-y-3">
              {PROVEEDORES.map((proveedor) => {
                const info = PROVEEDORES_INFO[proveedor];

                if (!info) return null;

                const Icon = info.icono;

                return (
                  <a
                    key={proveedor}
                    href={urlLogin(proveedor)}
                    className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-500/50 dark:hover:bg-slate-700"
                  >
                    <span className="flex items-center gap-4">
                      <Icon size={21} className="text-slate-600 dark:text-slate-300" />
                      {info.descripcion}
                    </span>

                    <ArrowUpRight
                      size={17}
                      className="text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                    />
                  </a>
                );
              })}
            </div>

            {/* Separador */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400">
                AUTENTICACIÓN SEGURA
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />

                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Tu acceso se realiza mediante proveedores externos
                  de autenticación. No necesitas crear una contraseña
                  adicional para MiVida Digital.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Al continuar, podrás acceder a las herramientas de
              MiVida Digital.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;

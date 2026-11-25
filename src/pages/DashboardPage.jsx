import {
  FolderOpen,
  CheckSquare,
  Bell,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';

import StatCard from '../components/dashboard/StatCard';
import UpcomingTasks from '../components/dashboard/UpcomingTasks';

function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <section>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          TU ESPACIO PERSONAL
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          ¡Bienvenido a MiVida Digital!
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Organiza tus documentos, administra tus actividades y mantén
          toda tu información importante en un solo lugar.
        </p>
      </section>

      {/* Estadísticas */}
      <section>
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Resumen general
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Una vista rápida de tu actividad
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Documentos"
            value="12"
            description="Archivos almacenados"
            icon={FolderOpen}
            color="emerald"
          />

          <StatCard
            title="Tareas pendientes"
            value="4"
            description="Actividades por completar"
            icon={CheckSquare}
            color="blue"
          />

          <StatCard
            title="Recordatorios"
            value="3"
            description="Próximos avisos programados"
            icon={Bell}
            color="violet"
          />

          <StatCard
            title="Consultas fiscales"
            value="2"
            description="Cálculos realizados"
            icon={Calculator}
            color="amber"
          />
        </div>
      </section>

      {/* Actividades y acceso rápido */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UpcomingTasks />
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <FolderOpen size={23} />
          </div>

          <h3 className="mt-5 text-xl font-bold">
            Todo en un solo lugar
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-emerald-50">
            Accede a tus documentos personales y mantén organizada
            tu información importante.
          </p>

          <a
            href="/archivos"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            Ver mis documentos
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;

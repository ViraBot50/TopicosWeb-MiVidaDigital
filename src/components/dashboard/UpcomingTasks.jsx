import { CalendarDays, Clock3 } from 'lucide-react';

const activities = [
  {
    title: 'Revisar documentos personales',
    category: 'Documentos',
    date: 'Hoy',
    time: '16:00',
    color: 'bg-blue-500',
  },
  {
    title: 'Consultar obligaciones fiscales',
    category: 'Finanzas',
    date: 'Mañana',
    time: '10:30',
    color: 'bg-emerald-500',
  },
  {
    title: 'Actualizar información personal',
    category: 'Personal',
    date: '28 Nov',
    time: '12:00',
    color: 'bg-violet-500',
  },
];

function UpcomingTasks() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Próximas actividades
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Mantente al día con tus pendientes
          </p>
        </div>

        <CalendarDays className="text-emerald-600 dark:text-emerald-400" size={21} />
      </div>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className={`mt-1 h-10 w-1 rounded-full ${activity.color}`} />

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {activity.title}
              </h4>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {activity.category}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  {activity.date}
                </span>

                <span className="flex items-center gap-1">
                  <Clock3 size={13} />
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UpcomingTasks;
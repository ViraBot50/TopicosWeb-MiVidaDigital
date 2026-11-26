function FiltrosDocumentos({
  filtros,
  categorias = [],
  onCambiar,
  onLimpiar,
}) {
  function cambiar(campo, valor) {
    onCambiar({
      ...filtros,
      [campo]: valor,
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Buscar y filtrar
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Encuentra documentos por nombre, categoría o estado.
          </p>
        </div>

        <button
          type="button"
          onClick={onLimpiar}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Buscar documento
          </label>
          <input
            type="search"
            value={filtros.q}
            onChange={(evento) => cambiar('q', evento.target.value)}
            placeholder="Ej. Identificación, contrato..."
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Categoría
          </label>
          <select
            value={filtros.categoria}
            onChange={(evento) => cambiar('categoria', evento.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.slug} value={categoria.slug}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(evento) => cambiar('estado', evento.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Todos los estados</option>
            <option value="vigente">Vigente</option>
            <option value="por_vencer">Por vencer</option>
            <option value="vencido">Vencido</option>
            <option value="sin_vencimiento">Sin vencimiento</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Ordenar por
          </label>
          <select
            value={filtros.orden}
            onChange={(evento) => cambiar('orden', evento.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="recientes">Más recientes</option>
            <option value="vencimiento">Fecha de vencimiento</option>
            <option value="nombre">Nombre</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Vence después de
          </label>
          <input
            type="date"
            value={filtros.vence_despues}
            onChange={(evento) =>
              cambiar('vence_despues', evento.target.value)
            }
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Vence antes de
          </label>
          <input
            type="date"
            value={filtros.vence_antes}
            onChange={(evento) =>
              cambiar('vence_antes', evento.target.value)
            }
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>
    </section>
  );
}

export default FiltrosDocumentos;

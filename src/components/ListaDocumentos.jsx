const ESTADOS = {
  vigente: {
    texto: 'Vigente',
    clases: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
  por_vencer: {
    texto: 'Por vencer',
    clases: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  vencido: {
    texto: 'Vencido',
    clases: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
  sin_vencimiento: {
    texto: 'Sin vencimiento',
    clases: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  },
};

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';

  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

function ListaDocumentos({
  documentos = [],
  cargando = false,
  onActualizar,
  onDescargar,
  onEliminar,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Mis documentos
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Consulta y administra los documentos de tu bóveda digital.
          </p>
        </div>

        <button
          type="button"
          onClick={onActualizar}
          disabled={cargando}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {cargando ? 'Actualizando...' : 'Actualizar lista'}
        </button>
      </div>

      {cargando && documentos.length === 0 ? (
        <p className="py-8 text-center text-slate-500 dark:text-slate-400">
          Cargando documentos...
        </p>
      ) : documentos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center dark:border-slate-600">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            Aún no tienes documentos registrados.
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cuando registres un documento, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-3 py-3 font-medium">Documento</th>
                <th className="px-3 py-3 font-medium">Categoría</th>
                <th className="px-3 py-3 font-medium">Vencimiento</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-3 py-3 font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {documentos.map((documento) => {
                const estado =
                  ESTADOS[documento.estado] ?? ESTADOS.sin_vencimiento;

                return (
                  <tr
                    key={documento.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-700"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-800 dark:text-white">
                        {documento.nombre}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {documento.archivo?.nombre_archivo ?? 'Sin archivo'}
                      </p>

                      {documento.etiquetas?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {documento.etiquetas.map((etiqueta) => (
                            <span
                              key={etiqueta.id}
                              className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            >
                              {etiqueta.nombre}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-4 capitalize text-slate-600 dark:text-slate-300">
                      {documento.categoria?.nombre ??
                        documento.categoria?.slug ??
                        documento.categoria ??
                        'Sin categoría'}
                    </td>

                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">
                      {formatearFecha(documento.fecha_vencimiento)}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${estado.clases}`}
                      >
                        {estado.texto}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onDescargar(documento)}
                          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-40 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                        >
                          Descargar
                        </button>

                        <button
                          type="button"
                          onClick={() => onEliminar(documento)}
                          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ListaDocumentos;

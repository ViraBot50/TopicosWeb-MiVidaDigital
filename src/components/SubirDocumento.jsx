import { useState } from 'react';

const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const TAMANO_MAXIMO = 10 * 1024 * 1024;

// Formulario para registrar documentos en la Bóveda Digital.
function SubirDocumento({
  onSubir,
  deshabilitado = false,
  categorias = [],
  etiquetas = [],
}) {
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  function seleccionarArchivo(evento) {
    const seleccionado = evento.target.files?.[0] ?? null;
    setError('');

    if (!seleccionado) {
      setArchivo(null);
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(seleccionado.type)) {
      setError('Formato no permitido. Selecciona un PDF, JPG o PNG.');
      setArchivo(null);
      evento.target.value = '';
      return;
    }

    if (seleccionado.size > TAMANO_MAXIMO) {
      setError('El archivo supera el tamaño máximo de 10 MB.');
      setArchivo(null);
      evento.target.value = '';
      return;
    }

    setArchivo(seleccionado);

    if (!nombre.trim()) {
      setNombre(seleccionado.name.replace(/\.[^/.]+$/, ''));
    }
  }

  function cambiarEtiquetas(evento) {
    const seleccionadas = Array.from(
      evento.target.selectedOptions,
      (opcion) => opcion.value
    );

    setEtiquetasSeleccionadas(seleccionadas);
  }

  function limpiarFormulario(formulario) {
    formulario.reset();
    setArchivo(null);
    setNombre('');
    setDescripcion('');
    setCategoria('');
    setFechaEmision('');
    setFechaVencimiento('');
    setInstitucion('');
    setEtiquetasSeleccionadas([]);
    setError('');
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError('');

    if (!archivo) {
      setError('Selecciona un archivo para continuar.');
      return;
    }

    if (!nombre.trim()) {
      setError('Escribe el nombre del documento.');
      return;
    }

    if (!categoria) {
      setError('Selecciona una categoría.');
      return;
    }

    if (
      fechaEmision &&
      fechaVencimiento &&
      fechaVencimiento < fechaEmision
    ) {
      setError('La fecha de vencimiento no puede ser anterior a la fecha de emisión.');
      return;
    }

    const formulario = evento.currentTarget;
    setSubiendo(true);

    try {
      const resultado = await onSubir({
        archivo,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria,
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento,
        institucion_emisora: institucion.trim(),
        etiquetas: etiquetasSeleccionadas,
      });

      if (resultado) {
        limpiarFormulario(formulario);
      }
    } catch {
      setError('No se pudo registrar el documento.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          Registrar documento
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sube un archivo y completa su información para guardarlo en tu bóveda digital.
        </p>
      </div>

      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Archivo *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            disabled={deshabilitado || subiendo}
            onChange={seleccionarArchivo}
            className="block w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Formatos permitidos: PDF, JPG y PNG. Máximo 10 MB.
          </p>

          {archivo && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Seleccionado: {archivo.name} (
              {(archivo.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Nombre del documento *
          </label>
          <input
            type="text"
            maxLength={150}
            required
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            placeholder="Ej. Identificación oficial"
            disabled={deshabilitado || subiendo}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Categoría *
          </label>
          <select
            required
            value={categoria}
            onChange={(evento) => setCategoria(evento.target.value)}
            disabled={deshabilitado || subiendo}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Descripción
          </label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
            placeholder="Información adicional del documento"
            disabled={deshabilitado || subiendo}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha de emisión
            </label>
            <input
              type="date"
              value={fechaEmision}
              onChange={(evento) => setFechaEmision(evento.target.value)}
              disabled={deshabilitado || subiendo}
              className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(evento) => setFechaVencimiento(evento.target.value)}
              disabled={deshabilitado || subiendo}
              className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Institución emisora
          </label>
          <input
            type="text"
            value={institucion}
            onChange={(evento) => setInstitucion(evento.target.value)}
            placeholder="Ej. Gobierno de México"
            disabled={deshabilitado || subiendo}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Etiquetas
          </label>
          <select
            multiple
            value={etiquetasSeleccionadas}
            onChange={cambiarEtiquetas}
            disabled={deshabilitado || subiendo}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            {etiquetas.map((etiqueta) => (
              <option key={etiqueta.id} value={String(etiqueta.id)}>
                {etiqueta.nombre}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Mantén presionada la tecla Ctrl para seleccionar varias etiquetas.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {deshabilitado && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Conecta Google Drive para poder registrar documentos.
          </p>
        )}

        <button
          type="submit"
          disabled={!archivo || subiendo || deshabilitado}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {subiendo ? 'Registrando documento...' : 'Guardar documento'}
        </button>
      </form>
    </section>
  );
}

export default SubirDocumento;

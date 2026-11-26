import { useCallback, useEffect, useState } from 'react';

import {
  crearDocumento,
  descargarDocumento,
  eliminarDocumento,
  listarDocumentos,
} from '../api/documentos';

import { listarCategorias } from '../api/categorias';
import { listarEtiquetas } from '../api/etiquetas';

import { useAuth } from '../auth/useAuth';
import Avisos from '../components/Avisos.jsx';
import DriveConexion from '../components/DriveConexion.jsx';
import SubirDocumento from '../components/SubirDocumento.jsx';
import ListaDocumentos from '../components/ListaDocumentos.jsx';
import FiltrosDocumentos from '../components/FiltrosDocumentos.jsx';

const FILTROS_INICIALES = {
  q: '',
  categoria: '',
  estado: '',
  orden: 'recientes',
  vence_antes: '',
  vence_despues: '',
};

const LIMITE_PAGINA = 10;

function ArchivosPage() {
  const { usuario, drive, verificarSesion } = useAuth();

  const [documentos, setDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const manejarError = useCallback(
    (fallo) => {
      if (fallo.codigo === 'DRIVE_NO_CONECTADO') {
        verificarSesion();
      }

      setError(fallo.message || 'Ocurrió un error inesperado.');
    },
    [verificarSesion]
  );

  // Carga documentos aplicando los filtros y la paginación.
  const cargarDocumentos = useCallback(async () => {
    setCargando(true);

    try {
      const respuesta = await listarDocumentos({
        ...filtros,
        limit: LIMITE_PAGINA,
        offset,
      });

      setDocumentos(respuesta.documentos ?? []);
      setTotal(respuesta.paginacion?.total ?? 0);
      setError('');
    } catch (fallo) {
      if (fallo.status !== 401) {
        manejarError(fallo);
      }
    } finally {
      setCargando(false);
    }
  }, [filtros, offset, manejarError]);

  // Carga las categorías y etiquetas disponibles.
  const cargarCatalogos = useCallback(async () => {
    try {
      const datosCategorias = await listarCategorias();
      setCategorias(datosCategorias ?? []);
    } catch (fallo) {
      if (fallo.status !== 401) {
        manejarError(fallo);
      }
    }

    try {
      const datosEtiquetas = await listarEtiquetas();
      setEtiquetas(datosEtiquetas ?? []);
    } catch (fallo) {
      if (fallo.status !== 401) {
        manejarError(fallo);
      }
    }
  }, [manejarError]);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]);

  // Registra un documento nuevo.
  async function subir(datosDocumento) {
    setMensaje('');
    setError('');

    try {
      const respuesta = await crearDocumento(datosDocumento);

      setMensaje(
        respuesta.mensaje || 'Documento registrado correctamente.'
      );

      setOffset(0);

      // Actualizamos la lista con los documentos registrados.
      const actualizados = await listarDocumentos({
        ...filtros,
        limit: LIMITE_PAGINA,
        offset: 0,
      });

      setDocumentos(actualizados.documentos ?? []);
      setTotal(actualizados.paginacion?.total ?? 0);

      return true;
    } catch (fallo) {
      if (fallo.status !== 401) {
        manejarError(fallo);
      }

      return false;
    }
  }

  // Descarga un documento utilizando su ID.
  async function descargar(documento) {
    setMensaje('');
    setError('');

    try {
      await descargarDocumento(
        documento.id,
        documento.archivo?.nombre_archivo || documento.nombre
      );
    } catch (fallo) {
      if (fallo.status !== 401) {
        manejarError(fallo);
      }
    }
  }

  // Elimina un documento y actualiza la lista.
  async function eliminar(documento) {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${documento.nombre}"? Esta acción también eliminará su archivo asociado y no se puede deshacer.`
    );

    if (!confirmar) return;

    setMensaje('');
    setError('');

    try {
      const respuesta = await eliminarDocumento(documento.id);

      setMensaje(
        respuesta.mensaje || 'Documento eliminado correctamente.'
      );

      await cargarDocumentos();
    } catch (fallo) {
      if (fallo.status !== 401) {
        manejarError(fallo);
      }
    }
  }

  function cambiarFiltros(nuevosFiltros) {
    setFiltros(nuevosFiltros);
    setOffset(0);
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
    setOffset(0);
  }

  const paginaActual = Math.floor(offset / LIMITE_PAGINA) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_PAGINA));

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Bóveda Digital
        </h1>

        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Organiza, consulta y administra tus documentos personales desde un solo lugar.
        </p>
      </header>

      <Avisos mensaje={mensaje} error={error} />

      {usuario && (
        <section className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          {usuario.foto && (
            <img
              src={usuario.foto}
              alt="Foto de perfil"
              className="h-12 w-12 rounded-full object-cover"
            />
          )}

          <div>
            <p className="font-medium text-slate-800 dark:text-white">
              {usuario.nombre || 'Bienvenido'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {usuario.correo}
            </p>
          </div>
        </section>
      )}

      <DriveConexion
        drive={drive}
        onCambio={verificarSesion}
        onError={setError}
      />

      <SubirDocumento
        onSubir={subir}
        deshabilitado={!drive.conectado}
        categorias={categorias}
        etiquetas={etiquetas}
      />

      <FiltrosDocumentos
        filtros={filtros}
        categorias={categorias}
        onCambiar={cambiarFiltros}
        onLimpiar={limpiarFiltros}
      />

      <ListaDocumentos
        documentos={documentos}
        cargando={cargando}
        onActualizar={cargarDocumentos}
        onDescargar={descargar}
        onEliminar={eliminar}
      />

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Página {paginaActual} de {totalPaginas} · {total} documentos
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0 || cargando}
              onClick={() =>
                setOffset((actual) =>
                  Math.max(0, actual - LIMITE_PAGINA)
                )
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={
                offset + LIMITE_PAGINA >= total || cargando
              }
              onClick={() =>
                setOffset((actual) => actual + LIMITE_PAGINA)
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ArchivosPage;

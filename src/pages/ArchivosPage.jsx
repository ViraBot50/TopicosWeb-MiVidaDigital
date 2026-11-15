import { useCallback, useEffect, useState } from 'react';
import {
  descargarArchivo,
  eliminarArchivo,
  listarArchivos,
  subirArchivo,
} from '../api/archivos';
import { useAuth } from '../auth/useAuth';
import Avisos from '../components/Avisos.jsx';
import DriveConexion from '../components/DriveConexion.jsx';
import ListaArchivos from '../components/ListaArchivos.jsx';
import SubirArchivo from '../components/SubirArchivo.jsx';
import { useAvisoDeUrl } from '../hooks/useAvisoDeUrl';

function ArchivosPage() {
  const { usuario, drive, cerrarSesion, verificarSesion } = useAuth();
  const avisoUrl = useAvisoDeUrl();

  const [archivos, setArchivos] = useState([]);
  const [mensaje, setMensaje] = useState(
    !avisoUrl?.esError ? avisoUrl?.mensaje ?? '' : ''
  );
  const [error, setError] = useState(avisoUrl?.esError ? avisoUrl.mensaje : '');

  // Si Drive responde "no conectado", se actualiza el estado para mostrar el botón de conectar.
  const manejarError = useCallback(
    (fallo) => {
      if (fallo.codigo === 'DRIVE_NO_CONECTADO') verificarSesion();
      setError(fallo.message);
    },
    [verificarSesion]
  );

  const cargarArchivos = useCallback(async () => {
    try {
      setArchivos(await listarArchivos());
      setError('');
    } catch (fallo) {
      // Un 401 ya lo gestiona AuthProvider (vuelve al login).
      if (fallo.status !== 401) manejarError(fallo);
    }
  }, [manejarError]);

  // Carga inicial de la lista.
  useEffect(() => {
    async function cargarAlAbrir() {
      await cargarArchivos();
    }

    cargarAlAbrir();
  }, [cargarArchivos]);

  // Devuelve true si se subió (para que el formulario se limpie).
  async function subir(archivo) {
    setMensaje('');
    setError('');

    try {
      const datos = await subirArchivo(archivo);
      setMensaje(datos.mensaje);
      await cargarArchivos();
      return true;
    } catch (fallo) {
      if (fallo.status !== 401) manejarError(fallo);
      return false;
    }
  }

  async function descargar(archivo) {
    setMensaje('');
    setError('');

    try {
      await descargarArchivo(archivo.id, archivo.nombre_archivo);
    } catch (fallo) {
      if (fallo.status !== 401) manejarError(fallo);
    }
  }

  async function eliminar(archivo) {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${archivo.nombre_archivo}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    setMensaje('');
    setError('');

    try {
      const datos = await eliminarArchivo(archivo.id);
      setMensaje(datos.mensaje);
      await cargarArchivos();
    } catch (fallo) {
      if (fallo.status !== 401) manejarError(fallo);
    }
  }

  async function salir(scope) {
    try {
      await cerrarSesion(scope);
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <main>
      <h1>Prototipo de Google Drive</h1>

      <Avisos mensaje={mensaje} error={error} />

      <section>
        <h2>Bienvenido</h2>

        {usuario.foto && <img src={usuario.foto} alt="Foto de perfil" width="80" />}

        <p>
          <strong>Nombre:</strong> {usuario.nombre}
        </p>
        <p>
          <strong>Correo:</strong> {usuario.correo ?? 'Sin correo'}
        </p>
        <p>
          <strong>Inicio de sesión con:</strong> {usuario.proveedores.join(', ')}
        </p>

        <button type="button" onClick={() => salir('local')}>
          Cerrar sesión
        </button>
        <button type="button" onClick={() => salir('global')}>
          Cerrar sesión en todos los dispositivos
        </button>
      </section>

      <hr />

      <DriveConexion drive={drive} onCambio={verificarSesion} onError={setError} />

      <hr />

      <SubirArchivo onSubir={subir} deshabilitado={!drive.conectado} />

      <hr />

      <ListaArchivos
        archivos={archivos}
        onActualizar={cargarArchivos}
        onDescargar={descargar}
        onEliminar={eliminar}
      />
    </main>
  );
}

export default ArchivosPage;

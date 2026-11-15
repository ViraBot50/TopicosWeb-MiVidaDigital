import { desconectarDrive, urlConectarDrive } from '../api/drive';

// Estado de la conexión con Google Drive.
// Quien entra con GitHub o Discord debe conectar Drive una vez.
function DriveConexion({ drive, onCambio, onError }) {
  async function desconectar() {
    try {
      await desconectarDrive();
      await onCambio();
    } catch (error) {
      onError(error.message);
    }
  }

  if (!drive.conectado) {
    return (
      <section>
        <h2>Google Drive</h2>
        <p>Aún no has conectado tu Google Drive.</p>
        <a href={urlConectarDrive()}>Conectar Google Drive</a>
      </section>
    );
  }

  return (
    <section>
      <h2>Google Drive</h2>
      <p>Conectado{drive.correo ? ` como ${drive.correo}` : ''}.</p>
      <button type="button" onClick={desconectar}>
        Desconectar Google Drive
      </button>
    </section>
  );
}

export default DriveConexion;

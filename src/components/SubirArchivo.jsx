import { useState } from 'react';

// Formulario de subida. onSubir(archivo) debe devolver una promesa.
function SubirArchivo({ onSubir, deshabilitado }) {
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    if (!archivo) return;

    const formulario = evento.currentTarget;
    setSubiendo(true);

    const subido = await onSubir(archivo);

    setSubiendo(false);
    if (subido) {
      setArchivo(null);
      formulario.reset();
    }
  }

  return (
    <section>
      <h2>Subir archivo</h2>

      <form onSubmit={enviar}>
        <input
          type="file"
          disabled={deshabilitado}
          onChange={(evento) => setArchivo(evento.target.files?.[0] ?? null)}
        />

        <button type="submit" disabled={!archivo || subiendo || deshabilitado}>
          {subiendo ? 'Subiendo...' : 'Subir archivo'}
        </button>
      </form>

      {archivo && (
        <p>
          Archivo seleccionado: {archivo.name} ({(archivo.size / 1024).toFixed(2)} KB)
        </p>
      )}

      <p>Tamaño máximo permitido: 10 MB.</p>
    </section>
  );
}

export default SubirArchivo;

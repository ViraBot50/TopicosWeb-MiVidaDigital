function ListaArchivos({ archivos, onActualizar, onDescargar, onEliminar }) {
  return (
    <section>
      <h2>Mis archivos</h2>

      <button type="button" onClick={onActualizar}>
        Actualizar lista
      </button>

      {archivos.length === 0 ? (
        <p>Aún no tienes archivos registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha de carga</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {archivos.map((archivo) => (
              <tr key={archivo.id}>
                <td>{archivo.nombre_archivo}</td>
                <td>
                  {archivo.fecha_carga
                    ? new Date(archivo.fecha_carga).toLocaleString()
                    : 'Sin fecha'}
                </td>
                <td>
                  <button type="button" onClick={() => onDescargar(archivo)}>
                    Descargar
                  </button>
                  <button type="button" onClick={() => onEliminar(archivo)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default ListaArchivos;

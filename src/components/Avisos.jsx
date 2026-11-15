// Muestra un mensaje informativo y/o de error.
function Avisos({ mensaje, error }) {
  return (
    <>
      {mensaje && <p>{mensaje}</p>}
      {error && <p role="alert">Error: {error}</p>}
    </>
  );
}

export default Avisos;

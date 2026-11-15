import { useEffect, useState } from 'react';

const MENSAJES = {
  'error=login': 'No se pudo iniciar sesión. Inténtalo de nuevo.',
  'error=sesion': 'Tu sesión no está activa. Inicia sesión.',
  'drive=conectado': 'Google Drive conectado correctamente.',
  'drive=error': 'No se pudo conectar Google Drive. Inténtalo de nuevo.',
};

// El backend redirige al frontend con ?error=... o ?drive=...
// Se lee una vez, se traduce a un mensaje y se limpia la URL.
export function useAvisoDeUrl() {
  const [aviso] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    for (const [clave, valor] of params) {
      const mensaje = MENSAJES[`${clave}=${valor}`];
      if (mensaje) return { mensaje, esError: clave === 'error' || valor === 'error' };
    }

    return null;
  });

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return aviso;
}

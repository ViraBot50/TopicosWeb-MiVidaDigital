import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import { EVENTO_SESION_INVALIDA } from '../api/http';
import { cerrarSesion, consultarSesion } from '../api/session';
import { INTERVALO_VERIFICAR_SESION_MS } from '../config';

const CANAL = 'prototipo-auth';

const AVISO_SESION_CERRADA =
  'Tu sesión se cerró (en este u otro dispositivo, o expiró). Inicia sesión de nuevo.';

/*
 * La sesión vive en cookies httpOnly: JavaScript NO puede leerlas, así que el
 * frontend se entera de si sigue activa preguntándole al backend:
 *   1. al abrir la app
 *   2. cada INTERVALO_VERIFICAR_SESION_MS
 *   3. al volver a la pestaña (foco / visibilidad)
 *   4. cuando cualquier petición recibe 401
 *   5. cuando otra pestaña avisa (BroadcastChannel) que cerró sesión
 */
export function AuthProvider({ children }) {
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'autenticado' | 'anonimo'
  const [usuario, setUsuario] = useState(null);
  const [drive, setDrive] = useState({ conectado: false, correo: null });
  const [aviso, setAviso] = useState('');

  const estadoRef = useRef('cargando');
  const canalRef = useRef(null);

  const aplicarAnonimo = useCallback((nuevoAviso = '') => {
    // Si estaba autenticado y deja de estarlo sin que el usuario lo pidiera, se avisa.
    estadoRef.current = 'anonimo';
    setEstado('anonimo');
    setUsuario(null);
    setDrive({ conectado: false, correo: null });
    setAviso(nuevoAviso);
  }, []);

  const verificarSesion = useCallback(async () => {
    try {
      const datos = await consultarSesion();

      if (datos.autenticado) {
        const veniaDeAnonimo = estadoRef.current === 'anonimo';

        estadoRef.current = 'autenticado';
        setEstado('autenticado');
        setUsuario(datos.usuario);
        setDrive(datos.drive);
        setAviso('');

        // Avisar a las otras pestañas que ya hay sesión.
        if (veniaDeAnonimo) canalRef.current?.postMessage('login');
        return;
      }

      aplicarAnonimo(estadoRef.current === 'autenticado' ? AVISO_SESION_CERRADA : '');
    } catch {
      // Sin conexión o backend caído (503): se conserva el estado actual.
      if (estadoRef.current === 'cargando') {
        aplicarAnonimo('No se pudo conectar con el servidor.');
      }
    }
  }, [aplicarAnonimo]);

  // 1) Verificación inicial + canal entre pestañas.
  useEffect(() => {
    const canal = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CANAL) : null;
    canalRef.current = canal;

    if (canal) {
      canal.onmessage = (evento) => {
        if (evento.data === 'logout') aplicarAnonimo(AVISO_SESION_CERRADA);
        if (evento.data === 'login') verificarSesion();
      };
    }

    async function verificarAlAbrir() {
      await verificarSesion();
    }

    verificarAlAbrir();

    return () => canal?.close();
  }, [aplicarAnonimo, verificarSesion]);

  // 2, 3 y 4) Intervalo, foco y 401 de cualquier petición.
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (estadoRef.current === 'autenticado') verificarSesion();
    }, INTERVALO_VERIFICAR_SESION_MS);

    const alVolver = () => {
      if (document.visibilityState === 'visible') verificarSesion();
    };

    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', verificarSesion);
    window.addEventListener(EVENTO_SESION_INVALIDA, verificarSesion);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', verificarSesion);
      window.removeEventListener(EVENTO_SESION_INVALIDA, verificarSesion);
    };
  }, [verificarSesion]);

  // scope: 'local' (este navegador) | 'global' (todos los dispositivos)
  const cerrar = useCallback(
    async (scope = 'local') => {
      await cerrarSesion(scope);
      canalRef.current?.postMessage('logout');
      aplicarAnonimo('');
    },
    [aplicarAnonimo]
  );

  const valor = useMemo(
    () => ({ estado, usuario, drive, aviso, cerrarSesion: cerrar, verificarSesion }),
    [estado, usuario, drive, aviso, cerrar, verificarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

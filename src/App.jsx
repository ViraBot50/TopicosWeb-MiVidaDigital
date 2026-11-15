import { useAuth } from './auth/useAuth';
import LoginPage from './pages/LoginPage.jsx';
import ArchivosPage from './pages/ArchivosPage.jsx';

// Punto de entrada de la interfaz. Aquí se puede añadir un router
// (react-router) cuando el equipo defina las pantallas.
function App() {
  const { estado } = useAuth();

  if (estado === 'cargando') {
    return <p>Comprobando sesión...</p>;
  }

  return estado === 'autenticado' ? <ArchivosPage /> : <LoginPage />;
}

export default App;

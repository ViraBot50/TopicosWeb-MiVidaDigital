import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuth } from './auth/useAuth';

import LoginPage from './pages/LoginPage';
import ArchivosPage from './pages/ArchivosPage';
import DashboardPage from './pages/DashboardPage';

import MainLayout from './components/layout/MainLayout';

function AppContent() {
  const { estado } = useAuth();

  if (estado === 'cargando') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Comprobando sesión...
        </p>
      </div>
    );
  }

  if (estado !== 'autenticado') {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/archivos" element={<ArchivosPage />} />

        <Route
          path="/recordatorios"
          element={<ComingSoon title="Recordatorios" />}
        />

        <Route
          path="/calculadora"
          element={<ComingSoon title="Calculadora" />}
        />

        <Route
          path="/tareas"
          element={<ComingSoon title="Mis tareas" />}
        />

        <Route
          path="/informacion"
          element={<ComingSoon title="Información" />}
        />

        <Route
          path="/configuracion"
          element={<ComingSoon title="Configuración" />}
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function ComingSoon({ title }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Esta sección estará disponible próximamente.
      </p>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

import { PROVEEDORES, urlLogin } from '../api/session';
import { useAuth } from '../auth/useAuth';
import Avisos from '../components/Avisos.jsx';
import { useAvisoDeUrl } from '../hooks/useAvisoDeUrl';

const NOMBRES = { google: 'Google', github: 'GitHub', discord: 'Discord' };

function LoginPage() {
  const { aviso } = useAuth();
  const avisoUrl = useAvisoDeUrl();

  return (
    <main>
      <h1>Prototipo de Google Drive</h1>

      <Avisos
        mensaje={aviso || (!avisoUrl?.esError ? avisoUrl?.mensaje : '')}
        error={avisoUrl?.esError ? avisoUrl.mensaje : ''}
      />

      <section>
        <p>Inicia sesión para administrar tus archivos.</p>

        {PROVEEDORES.map((proveedor) => (
          <p key={proveedor}>
            <a href={urlLogin(proveedor)}>
              Continuar con {NOMBRES[proveedor]}
            </a>
          </p>
        ))}
      </section>
    </main>
  );
}

export default LoginPage;

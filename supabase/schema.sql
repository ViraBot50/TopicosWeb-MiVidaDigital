-- Ejecutar en Supabase → SQL Editor.

-- 1) archivos: ahora pertenecen al usuario de Supabase Auth (uuid),
--    sin importar si entró con Google, GitHub o Discord.
alter table public.archivos
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists archivos_user_id_idx on public.archivos (user_id);

-- La columna anterior ya no se usa; se conserva para no perder datos.
alter table public.archivos alter column usuario_google_id drop not null;

-- (Opcional) Reasignar archivos antiguos a usuarios que ya iniciaron sesión
-- con Google mediante Supabase. Verifica el resultado antes de borrar nada.
update public.archivos a
set user_id = i.user_id
from auth.identities i
where a.user_id is null
  and i.provider = 'google'
  and i.provider_id = a.usuario_google_id;

-- 2) Conexión de Google Drive por usuario (refresh token CIFRADO por el backend).
create table if not exists public.drive_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  google_email text,
  refresh_token_enc text not null,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) RLS activado y SIN políticas: nadie con la clave pública puede leer estas
--    tablas. El backend usa la clave secreta, que ignora RLS.
alter table public.archivos enable row level security;
alter table public.drive_connections enable row level security;

# IdeaPais Backoffice

Base minima y estable para IdeaPais sobre Next.js App Router, Tailwind y Supabase.

## Foco de esta version

- Login Google estable y explicito.
- Sesion persistente en cliente con Supabase JS.
- Validacion de acceso contra `perfiles_usuarios`.
- Pantalla clara de acceso pendiente.
- Primera fase enfocada en dashboard, personas, formacion y usuarios.

## Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Rutas principales

- `/login`
- `/auth/complete`
- `/dashboard`
- `/dashboard/personas`
- `/dashboard/formacion`
- `/dashboard/formacion/asistencia`
- `/dashboard/formacion/rutas/[id]`
- `/dashboard/usuarios`

## Documentacion

- `docs/arquitectura-fase-1.md`
- `docs/vercel-supabase-deploy.md`

# IdeaPaís Backoffice

Aplicación interna construida con Next.js 14, Tailwind CSS y Supabase SSR.

## Puesta en marcha

1. Verifica las variables en `.env.local`.
2. Instala dependencias con `npm install`.
3. Ejecuta `npm run dev`.

## Supabase

- Auth: Google OAuth vía Supabase.
- Perfil y permisos: tabla `perfiles_usuarios`.
- Golden Record: tablas `dim_personas` y `personas_raw`.

## Módulos incluidos

- `/login`
- `/dashboard`
- `/dashboard/personas`
- `/dashboard/jd-jp`
- `/dashboard/usuarios`
- `/dashboard/formacion`
- `/dashboard/desarrollo`
- `/dashboard/estudios`

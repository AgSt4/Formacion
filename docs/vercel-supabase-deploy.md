# Despliegue Vercel + Supabase

## 1. Variables en Vercel

Define estas variables en `Project Settings > Environment Variables`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Configuralas en `Production`, `Preview` y `Development`.

## 2. URL Configuration en Supabase

En `Authentication > URL Configuration`:

- `Site URL`: tu dominio productivo exacto.
- `Redirect URLs`:
  - `https://TU-DOMINIO/auth/complete`
  - `https://TU-PROYECTO.vercel.app/auth/complete`
  - `http://localhost:3000/auth/complete`

## 3. Google Provider en Supabase

Mantén el proveedor Google activo en Supabase. No apuntes Google directo a Vercel ni a callbacks custom antiguos.

## 4. Deploy

1. `npm install`
2. `npm run build`
3. Deploy en Vercel

## 5. Checklist de estabilidad

- Si el login vuelve a `/login`, revisa `Redirect URLs`.
- Si entra a Google pero no al dashboard, revisa la variable `NEXT_PUBLIC_SUPABASE_URL`.
- Si entra pero ve `Acceso pendiente`, revisa `perfiles_usuarios`.
- Si falla solo en Vercel, verifica que las variables existan tambien en `Preview`.

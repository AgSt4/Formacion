# Arquitectura Fase 1

## Decision principal

Se elimina la dependencia de auth en middleware. El acceso se resuelve con:

1. `supabase.auth.signInWithOAuth` desde cliente.
2. Retorno a `/auth/complete`.
3. `setSession` manual con tokens del hash.
4. Carga del shell autenticado en `/dashboard`.
5. Validacion explicita de `perfiles_usuarios`.

## Por que esta base es mas estable

- Evita `MIDDLEWARE_INVOCATION_FAILED` en Vercel.
- Evita rebotes opacos entre `/login` y `/dashboard`.
- Evita fragilidad con PKCE al usar `flowType: "implicit"`.
- Si falla algo, el mensaje se muestra en pantalla.

## Estructura propuesta de carpetas

- `app`
- `app/login`
- `app/auth/complete`
- `app/dashboard`
- `app/dashboard/personas`
- `app/dashboard/formacion`
- `app/dashboard/formacion/asistencia`
- `app/dashboard/formacion/rutas/[id]`
- `app/dashboard/usuarios`
- `components`
- `lib/supabase`
- `docs`

## Alcance de la primera fase

- Login
- Dashboard base
- Sidebar por rol
- Directorio de personas
- Formacion: asistencia y rutas visuales
- Usuarios/perfiles

## Siguiente fase sugerida

- Persistencia real de rutas formativas con tablas propias.
- Filtros por area y sede.
- Integraciones analiticas adicionales.

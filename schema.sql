-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.areas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  CONSTRAINT areas_pkey PRIMARY KEY (id)
);

CREATE TABLE public.dim_actividades (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sede_id uuid,
  area_id uuid,
  nombre text NOT NULL,
  tipo text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  es_masiva boolean DEFAULT false,
  CONSTRAINT dim_actividades_pkey PRIMARY KEY (id),
  CONSTRAINT dim_actividades_sede_id_fkey FOREIGN KEY (sede_id) REFERENCES public.sedes(id),
  CONSTRAINT dim_actividades_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id)
);

CREATE TABLE public.dim_instituciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (
    tipo = ANY (ARRAY['Colegio'::text, 'Universidad'::text, 'ONG'::text, 'Empresa'::text, 'Gobierno'::text, 'Otro'::text])
  ),
  rut text UNIQUE,
  pais text DEFAULT 'Chile'::text,
  nivel_cercania integer DEFAULT 1 CHECK (nivel_cercania >= 1 AND nivel_cercania <= 5),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dim_instituciones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.dim_personas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  rut text UNIQUE,
  email text UNIQUE,
  nombres text NOT NULL,
  apellido_1 text NOT NULL,
  telefono text,
  fecha_nacimiento date,
  sexo text CHECK (sexo = ANY (ARRAY['Femenino'::text, 'Masculino'::text])),
  comuna text,
  nivel_prioridad integer DEFAULT 1 CHECK (nivel_prioridad >= 1 AND nivel_prioridad <= 5),
  sensibilidad_tematica ARRAY,
  estado_fidelizacion text DEFAULT 'Captación'::text CHECK (
    estado_fidelizacion = ANY (ARRAY['Captación'::text, 'Fidelización'::text, 'Activación'::text, 'Baja'::text])
  ),
  es_donante boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  apellido_2 text,
  país text DEFAULT 'Chile'::text,
  CONSTRAINT dim_personas_pkey PRIMARY KEY (id)
);

CREATE TABLE public.fact_asistencia (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  actividad_id uuid,
  dim_persona_id uuid,
  estado text DEFAULT 'Presente'::text CHECK (
    estado = ANY (ARRAY['Presente'::text, 'Ausente'::text, 'Justificado'::text, 'Atraso'::text])
  ),
  minutos_atraso integer DEFAULT 0,
  registrado_por uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fact_asistencia_pkey PRIMARY KEY (id),
  CONSTRAINT fact_asistencia_actividad_id_fkey FOREIGN KEY (actividad_id) REFERENCES public.dim_actividades(id),
  CONSTRAINT fact_asistencia_dim_persona_id_fkey FOREIGN KEY (dim_persona_id) REFERENCES public.dim_personas(id),
  CONSTRAINT fact_asistencia_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.perfiles_usuarios(id)
);

CREATE TABLE public.fact_interacciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dim_persona_id uuid,
  usuario_id uuid,
  tipo_interaccion text NOT NULL CHECK (
    tipo_interaccion = ANY (ARRAY['Reunion'::text, 'Correo'::text, 'Llamada'::text, 'Donacion'::text, 'Entrevista'::text])
  ),
  notas text,
  fecha_interaccion timestamp with time zone DEFAULT now(),
  CONSTRAINT fact_interacciones_pkey PRIMARY KEY (id),
  CONSTRAINT fact_interacciones_dim_persona_id_fkey FOREIGN KEY (dim_persona_id) REFERENCES public.dim_personas(id),
  CONSTRAINT fact_interacciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles_usuarios(id)
);

CREATE TABLE public.perfiles_usuarios (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  nombre_completo text NOT NULL,
  rol text NOT NULL CHECK (rol = ANY (ARRAY['admin'::text, 'encargado'::text, 'subencargado'::text, 'usuario'::text])),
  area_id uuid,
  sede_id uuid,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT perfiles_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT perfiles_usuarios_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id),
  CONSTRAINT perfiles_usuarios_sede_id_fkey FOREIGN KEY (sede_id) REFERENCES public.sedes(id)
);

CREATE TABLE public.personas_raw (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dim_persona_id uuid,
  fuente text NOT NULL,
  rut_ingresado text,
  email_ingresado text,
  nombres_ingresados text,
  apellido_1_ingresados text,
  otros_datos jsonb,
  procesado boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  apellido_2_ingresados text,
  CONSTRAINT personas_raw_pkey PRIMARY KEY (id),
  CONSTRAINT personas_raw_dim_persona_id_fkey FOREIGN KEY (dim_persona_id) REFERENCES public.dim_personas(id)
);

CREATE TABLE public.rel_conexiones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nodo_origen_tipo text NOT NULL CHECK (nodo_origen_tipo = ANY (ARRAY['persona'::text, 'institucion'::text])),
  nodo_origen_id uuid NOT NULL,
  nodo_destino_tipo text NOT NULL CHECK (nodo_destino_tipo = ANY (ARRAY['persona'::text, 'institucion'::text])),
  nodo_destino_id uuid NOT NULL,
  tipo_relacion text NOT NULL,
  metadata jsonb,
  fecha_inicio date,
  fecha_fin date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rel_conexiones_pkey PRIMARY KEY (id)
);

CREATE TABLE public.sedes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  area_id uuid,
  activa boolean DEFAULT true,
  CONSTRAINT sedes_pkey PRIMARY KEY (id),
  CONSTRAINT sedes_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id)
);

CREATE TABLE public.tareas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  asignador_id uuid,
  asignado_id uuid,
  dim_persona_id uuid,
  descripcion text NOT NULL,
  estado text DEFAULT 'Pendiente'::text CHECK (
    estado = ANY (ARRAY['Pendiente'::text, 'En Progreso'::text, 'Completada'::text, 'Cancelada'::text])
  ),
  fecha_limite date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tareas_pkey PRIMARY KEY (id),
  CONSTRAINT tareas_asignador_id_fkey FOREIGN KEY (asignador_id) REFERENCES public.perfiles_usuarios(id),
  CONSTRAINT tareas_asignado_id_fkey FOREIGN KEY (asignado_id) REFERENCES public.perfiles_usuarios(id),
  CONSTRAINT tareas_dim_persona_id_fkey FOREIGN KEY (dim_persona_id) REFERENCES public.dim_personas(id)
);

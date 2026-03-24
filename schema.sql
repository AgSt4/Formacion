-- ============================================================
-- SISTEMA DE FORMACIÓN POLÍTICA — SCHEMA COMPLETO
-- Pegar completo en Supabase SQL Editor y ejecutar
-- ============================================================

-- TABLAS BASE

CREATE TABLE sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  region text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('gestor', 'encargado')),
  sede_id uuid REFERENCES sedes(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL,
  rut text UNIQUE,
  email text UNIQUE,
  telefono text,
  whatsapp text,
  fecha_nac date,
  genero text CHECK (genero IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  colegio text,
  tipo_colegio text CHECK (tipo_colegio IN ('municipal', 'part.subv', 'part.pagado')),
  ano_egreso_colegio int,
  universidad text,
  carrera text,
  generacion text,
  instagram text,
  linkedin text,
  sensibilidades text,
  observaciones text,
  como_llego text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE persona_sede (
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE CASCADE,
  fecha_ingreso date DEFAULT CURRENT_DATE,
  PRIMARY KEY (persona_id, sede_id)
);

CREATE TABLE rutas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  periodo text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE hitos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id uuid REFERENCES rutas(id) ON DELETE CASCADE,
  orden int NOT NULL,
  nombre text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE persona_ruta (
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  ruta_id uuid REFERENCES rutas(id) ON DELETE CASCADE,
  hito_actual int DEFAULT 0,
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'pausado')),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (persona_id, ruta_id)
);

CREATE TABLE actividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id uuid REFERENCES sedes(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('congreso', 'curso', 'taller', 'invitacion', 'mentoria')),
  modalidad text CHECK (modalidad IN ('presencial', 'online', 'hibrido')),
  lugar text,
  fecha_inicio date,
  num_sesiones int DEFAULT 1,
  asistencia_minima_pct int DEFAULT 75,
  forma_aprobacion text,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE actividad_hito (
  actividad_id uuid REFERENCES actividades(id) ON DELETE CASCADE,
  hito_id uuid REFERENCES hitos(id) ON DELETE CASCADE,
  PRIMARY KEY (actividad_id, hito_id)
);

CREATE TABLE sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id uuid REFERENCES actividades(id) ON DELETE CASCADE,
  numero int NOT NULL,
  fecha date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE asistencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid REFERENCES sesiones(id) ON DELETE CASCADE,
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  presente boolean DEFAULT false,
  nota text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (sesion_id, persona_id)
);

CREATE TABLE feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE,
  actividad_id uuid REFERENCES actividades(id) ON DELETE CASCADE,
  tipo text,
  stars int CHECK (stars BETWEEN 1 AND 5),
  participacion int CHECK (participacion BETWEEN 1 AND 5),
  comprension int CHECK (comprension BETWEEN 1 AND 5),
  liderazgo int CHECK (liderazgo BETWEEN 1 AND 5),
  actitud int CHECK (actitud BETWEEN 1 AND 5),
  comentario text,
  recomendacion text,
  registrado_por uuid REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tareas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id uuid REFERENCES sedes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text,
  tipo_seguimiento text,
  kpi_nombre text,
  kpi_meta numeric,
  kpi_actual numeric DEFAULT 0,
  prioridad text DEFAULT 'media' CHECK (prioridad IN ('alta', 'media', 'baja')),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'atrasada')),
  fecha_limite date,
  respuesta_sede text,
  evaluacion_gestor text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE candidatos_duplicados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_a uuid REFERENCES personas(id) ON DELETE CASCADE,
  persona_b uuid REFERENCES personas(id) ON DELETE CASCADE,
  motivo text,
  confianza numeric,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'fusionado', 'descartado')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_sede ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_ruta ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_hito ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos_duplicados ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener rol del usuario actual
CREATE OR REPLACE FUNCTION get_my_rol()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid()
$$;

-- Función helper para obtener sede del usuario actual
CREATE OR REPLACE FUNCTION get_my_sede_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT sede_id FROM usuarios WHERE id = auth.uid()
$$;

-- SEDES
CREATE POLICY "gestor_all_sedes" ON sedes FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_read_own_sede" ON sedes FOR SELECT
  USING (get_my_rol() = 'encargado' AND id = get_my_sede_id());

-- USUARIOS
CREATE POLICY "gestor_all_usuarios" ON usuarios FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "self_read_usuario" ON usuarios FOR SELECT
  USING (id = auth.uid());

-- PERSONAS (a través de persona_sede)
CREATE POLICY "gestor_all_personas" ON personas FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_personas" ON personas FOR ALL
  USING (
    get_my_rol() = 'encargado' AND
    id IN (SELECT persona_id FROM persona_sede WHERE sede_id = get_my_sede_id())
  );

-- PERSONA_SEDE
CREATE POLICY "gestor_all_persona_sede" ON persona_sede FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_persona_sede" ON persona_sede FOR ALL
  USING (get_my_rol() = 'encargado' AND sede_id = get_my_sede_id());

-- RUTAS
CREATE POLICY "all_read_rutas" ON rutas FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "gestor_write_rutas" ON rutas FOR INSERT
  USING (get_my_rol() = 'gestor');
CREATE POLICY "gestor_update_rutas" ON rutas FOR UPDATE
  USING (get_my_rol() = 'gestor');
CREATE POLICY "gestor_delete_rutas" ON rutas FOR DELETE
  USING (get_my_rol() = 'gestor');

-- HITOS
CREATE POLICY "all_read_hitos" ON hitos FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "gestor_write_hitos" ON hitos FOR INSERT
  USING (get_my_rol() = 'gestor');
CREATE POLICY "gestor_update_hitos" ON hitos FOR UPDATE
  USING (get_my_rol() = 'gestor');
CREATE POLICY "gestor_delete_hitos" ON hitos FOR DELETE
  USING (get_my_rol() = 'gestor');

-- PERSONA_RUTA
CREATE POLICY "gestor_all_persona_ruta" ON persona_ruta FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_persona_ruta" ON persona_ruta FOR ALL
  USING (
    get_my_rol() = 'encargado' AND
    persona_id IN (SELECT persona_id FROM persona_sede WHERE sede_id = get_my_sede_id())
  );

-- ACTIVIDADES
CREATE POLICY "gestor_all_actividades" ON actividades FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_actividades" ON actividades FOR ALL
  USING (get_my_rol() = 'encargado' AND sede_id = get_my_sede_id());

-- ACTIVIDAD_HITO
CREATE POLICY "all_read_actividad_hito" ON actividad_hito FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "gestor_write_actividad_hito" ON actividad_hito FOR INSERT
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_write_actividad_hito" ON actividad_hito FOR INSERT
  USING (
    get_my_rol() = 'encargado' AND
    actividad_id IN (SELECT id FROM actividades WHERE sede_id = get_my_sede_id())
  );
CREATE POLICY "gestor_delete_actividad_hito" ON actividad_hito FOR DELETE
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_delete_actividad_hito" ON actividad_hito FOR DELETE
  USING (
    get_my_rol() = 'encargado' AND
    actividad_id IN (SELECT id FROM actividades WHERE sede_id = get_my_sede_id())
  );

-- SESIONES
CREATE POLICY "gestor_all_sesiones" ON sesiones FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_sesiones" ON sesiones FOR ALL
  USING (
    get_my_rol() = 'encargado' AND
    actividad_id IN (SELECT id FROM actividades WHERE sede_id = get_my_sede_id())
  );

-- ASISTENCIAS
CREATE POLICY "gestor_all_asistencias" ON asistencias FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_asistencias" ON asistencias FOR ALL
  USING (
    get_my_rol() = 'encargado' AND
    sesion_id IN (
      SELECT s.id FROM sesiones s
      JOIN actividades a ON s.actividad_id = a.id
      WHERE a.sede_id = get_my_sede_id()
    )
  );

-- FEEDBACKS
CREATE POLICY "gestor_all_feedbacks" ON feedbacks FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_feedbacks" ON feedbacks FOR ALL
  USING (
    get_my_rol() = 'encargado' AND
    actividad_id IN (SELECT id FROM actividades WHERE sede_id = get_my_sede_id())
  );

-- TAREAS
CREATE POLICY "gestor_all_tareas" ON tareas FOR ALL
  USING (get_my_rol() = 'gestor');
CREATE POLICY "encargado_own_sede_tareas" ON tareas FOR SELECT
  USING (get_my_rol() = 'encargado' AND sede_id = get_my_sede_id());
CREATE POLICY "encargado_update_own_sede_tareas" ON tareas FOR UPDATE
  USING (get_my_rol() = 'encargado' AND sede_id = get_my_sede_id());

-- CANDIDATOS DUPLICADOS
CREATE POLICY "gestor_all_duplicados" ON candidatos_duplicados FOR ALL
  USING (get_my_rol() = 'gestor');

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

-- Sedes
INSERT INTO sedes (id, nombre, region) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Santiago Centro', 'Región Metropolitana'),
  ('11111111-0000-0000-0000-000000000002', 'Valparaíso', 'Región de Valparaíso');

-- Rutas formativas
INSERT INTO rutas (id, nombre, descripcion, periodo) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Formación Base', 'Ruta inicial para nuevos integrantes', '2025'),
  ('22222222-0000-0000-0000-000000000002', 'Liderazgo Avanzado', 'Ruta para perfiles con mayor compromiso', '2025');

-- Hitos ruta 1
INSERT INTO hitos (id, ruta_id, orden, nombre) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 1, 'Inducción'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 2, 'Formación Básica'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 3, 'Participación Activa'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 4, 'Egreso');

-- Hitos ruta 2
INSERT INTO hitos (id, ruta_id, orden, nombre) VALUES
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', 1, 'Diagnóstico de Liderazgo'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000002', 2, 'Taller Comunicación'),
  ('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000002', 3, 'Proyecto Territorial'),
  ('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000002', 4, 'Certificación');

-- Personas de ejemplo
INSERT INTO personas (id, nombre, apellido, rut, email, telefono, genero, colegio, tipo_colegio, universidad, carrera, como_llego) VALUES
  ('44444444-0000-0000-0000-000000000001', 'Valentina', 'Rojas', '20.123.456-7', 'v.rojas@mail.com', '+56912345678', 'femenino', 'Liceo N°1', 'municipal', 'Universidad de Chile', 'Derecho', 'Redes sociales'),
  ('44444444-0000-0000-0000-000000000002', 'Matías', 'González', '21.234.567-8', 'm.gonzalez@mail.com', '+56923456789', 'masculino', 'Colegio San Ignacio', 'part.pagado', 'PUC', 'Ingeniería Comercial', 'Amigo'),
  ('44444444-0000-0000-0000-000000000003', 'Isidora', 'Fuentes', '22.345.678-9', 'i.fuentes@mail.com', '+56934567890', 'femenino', 'Liceo Carmela Carvajal', 'municipal', 'USACH', 'Psicología', 'Evento'),
  ('44444444-0000-0000-0000-000000000004', 'Diego', 'Morales', '19.456.789-0', 'd.morales@mail.com', '+56945678901', 'masculino', 'Colegio Pedro de Valdivia', 'part.subv', 'PUCV', 'Arquitectura', 'Instagram'),
  ('44444444-0000-0000-0000-000000000005', 'Catalina', 'Vega', '23.567.890-1', 'c.vega@mail.com', '+56956789012', 'femenino', 'Liceo Bicentenario', 'municipal', 'UV', 'Educación', 'Voluntariado');

-- Asignar personas a sedes
INSERT INTO persona_sede (persona_id, sede_id, fecha_ingreso) VALUES
  ('44444444-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '2025-03-01'),
  ('44444444-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', '2025-03-01'),
  ('44444444-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', '2025-04-01'),
  ('44444444-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', '2025-03-15'),
  ('44444444-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', '2025-03-15');

-- Asignar personas a rutas
INSERT INTO persona_ruta (persona_id, ruta_id, hito_actual, estado) VALUES
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 2, 'activo'),
  ('44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 3, 'activo'),
  ('44444444-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 1, 'activo'),
  ('44444444-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 1, 'activo'),
  ('44444444-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', 2, 'activo');

-- Actividades de ejemplo
INSERT INTO actividades (id, sede_id, nombre, tipo, modalidad, lugar, fecha_inicio, num_sesiones, asistencia_minima_pct, forma_aprobacion) VALUES
  ('55555555-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Taller de Oratoria', 'taller', 'presencial', 'Casa Central', '2025-04-10', 3, 75, 'Asistencia'),
  ('55555555-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Congreso Nacional Joven', 'congreso', 'presencial', 'Teatro Municipal', '2025-05-20', 1, 100, 'Asistencia'),
  ('55555555-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Curso de Liderazgo', 'curso', 'online', 'Zoom', '2025-04-15', 5, 80, 'Evaluación');

-- Sesiones para Taller de Oratoria
INSERT INTO sesiones (actividad_id, numero, fecha) VALUES
  ('55555555-0000-0000-0000-000000000001', 1, '2025-04-10'),
  ('55555555-0000-0000-0000-000000000001', 2, '2025-04-17'),
  ('55555555-0000-0000-0000-000000000001', 3, '2025-04-24');

-- Nota: Para crear usuarios gestor/encargado:
-- 1. Ir a Authentication → Users → Invite user con el email Gmail
-- 2. Copiar el UUID generado
-- 3. Ejecutar: INSERT INTO usuarios (id, nombre, rol, sede_id) VALUES ('[uuid]', '[nombre]', 'gestor', null);
-- Para encargado: INSERT INTO usuarios (id, nombre, rol, sede_id) VALUES ('[uuid]', '[nombre]', 'encargado', '[sede_id]');

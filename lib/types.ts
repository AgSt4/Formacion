export type UserRole = "admin" | "encargado" | "subencargado" | "usuario";

export type ProfileRecord = {
  id: string;
  email: string;
  nombre_completo: string;
  rol: UserRole;
  activo: boolean | null;
  area_id: string | null;
  sede_id: string | null;
  area?: {
    id: string;
    nombre: string;
  } | null;
  sede?: {
    id: string;
    nombre: string;
  } | null;
};

export type SessionUser = {
  id: string;
  email: string | null;
};

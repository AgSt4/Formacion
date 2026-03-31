import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "encargado" | "subencargado" | "usuario";

export type ProfileRecord = {
  id: string;
  email: string;
  nombre_completo: string;
  rol: UserRole;
  area_id: string | null;
  sede_id: string | null;
  activo: boolean | null;
  area: {
    id: string;
    nombre: string;
  } | null;
  sede: {
    id: string;
    nombre: string;
  } | null;
};

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data } = await supabase
    .from("perfiles_usuarios")
    .select(
      "id, email, nombre_completo, rol, area_id, sede_id, activo, area:areas(id, nombre), sede:sedes(id, nombre)"
    )
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: (data as ProfileRecord | null) ?? null
  };
});

export function canManageUsers(role: UserRole) {
  return role === "admin";
}

export function canReviewIdentity(role: UserRole) {
  return role === "admin" || role === "encargado";
}

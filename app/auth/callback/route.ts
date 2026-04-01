import { redirect } from "next/navigation";

export async function GET() {
  redirect("/login?error=La ruta /auth/callback ya no se usa. Configura /auth/complete.");
}

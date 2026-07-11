import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "./adminAuth";

/** Devuelve el usuario admin autenticado (o null) a partir de la cookie de sesión firmada. */
export async function requireAdmin(): Promise<string | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

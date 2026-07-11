/**
 * Cliente REST directo de Netlify Identity (GoTrue) -- SIN el widget oficial
 * netlify-identity-widget.js. En mercadodecafe.com el widget renderizaba su
 * modal en `display:none` de forma no confiable (nunca llegó a mostrarse en
 * pruebas headless contra el backend en vivo), lo que causaba "los botones
 * no abren nada". La reescritura a REST + modal propio resolvió el problema
 * y es el patrón que se reutiliza aquí desde el inicio.
 */

const IDENTITY_URL = process.env.NEXT_PUBLIC_IDENTITY_URL ?? "";

export interface IdentityUser {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

export interface IdentitySession {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch ms
  user: IdentityUser;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

function assertConfigured() {
  if (!IDENTITY_URL) {
    throw new Error(
      "NEXT_PUBLIC_IDENTITY_URL no configurada. Define el dominio de tu sitio Netlify con Identity habilitado."
    );
  }
}

async function parseJsonOrThrow(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.error_description || json?.msg || json?.error || `Error ${res.status}`;
    throw new Error(message);
  }
  return json;
}

async function tokenRequestToSession(json: TokenResponse): Promise<IdentitySession> {
  const user = await apiGetUser(json.access_token);
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000,
    user,
  };
}

export async function apiSignup(
  email: string,
  password: string,
  metadata: Record<string, unknown> = {}
): Promise<IdentityUser> {
  assertConfigured();
  const res = await fetch(`${IDENTITY_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, data: metadata }),
  });
  return parseJsonOrThrow(res);
}

export async function apiLoginPassword(email: string, password: string): Promise<IdentitySession> {
  assertConfigured();
  const body = new URLSearchParams({ grant_type: "password", username: email, password });
  const res = await fetch(`${IDENTITY_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await parseJsonOrThrow(res);
  return tokenRequestToSession(json);
}

export async function apiRefreshToken(refreshToken: string): Promise<IdentitySession> {
  assertConfigured();
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken });
  const res = await fetch(`${IDENTITY_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await parseJsonOrThrow(res);
  return tokenRequestToSession(json);
}

export async function apiGetUser(accessToken: string): Promise<IdentityUser> {
  assertConfigured();
  const res = await fetch(`${IDENTITY_URL}/user`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseJsonOrThrow(res);
}

export async function apiUpdateUser(
  accessToken: string,
  data: Record<string, unknown>
): Promise<IdentityUser> {
  assertConfigured();
  const res = await fetch(`${IDENTITY_URL}/user`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ data }),
  });
  return parseJsonOrThrow(res);
}

export async function apiRecover(email: string): Promise<void> {
  assertConfigured();
  const res = await fetch(`${IDENTITY_URL}/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  await parseJsonOrThrow(res);
}

/** Confirma un signup o completa un recovery a partir del token que llega en el link del correo. */
export async function apiVerify(
  type: "signup" | "recovery",
  token: string
): Promise<IdentitySession> {
  assertConfigured();
  const res = await fetch(`${IDENTITY_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, token }),
  });
  const json = await parseJsonOrThrow(res);
  return tokenRequestToSession(json);
}

/**
 * URL de inicio del flujo OAuth con Google (implicit grant de GoTrue).
 * Requiere habilitar Google en Netlify: Identity → External providers.
 * Al volver, GoTrue redirige al sitio con #access_token=...&refresh_token=...
 * que AuthContext procesa en handleAuthHash.
 */
export function getGoogleAuthUrl(): string {
  assertConfigured();
  return `${IDENTITY_URL}/authorize?provider=google`;
}

/** Construye una sesión a partir de tokens sueltos (retorno del flujo OAuth). */
export async function sessionFromTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<IdentitySession> {
  const user = await apiGetUser(accessToken);
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Date.now() + expiresIn * 1000,
    user,
  };
}

export async function apiSetNewPassword(accessToken: string, password: string): Promise<IdentityUser> {
  assertConfigured();
  const res = await fetch(`${IDENTITY_URL}/user`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password }),
  });
  return parseJsonOrThrow(res);
}

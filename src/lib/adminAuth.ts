/**
 * Autenticación del backoffice oculto (/panel-mnl-3x9k). MVP: 2 usuarios
 * hardcodeados vía env vars (nunca en el bundle cliente, esto solo corre en
 * el servidor). Sesión = cookie httpOnly firmada con HMAC-SHA256 usando Web
 * Crypto (crypto.subtle), sin librerías de JWT externas.
 */

export const ADMIN_SESSION_COOKIE = "mnl_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

interface AdminSessionPayload {
  user: string;
  exp: number; // epoch ms
}

function getAdminUsers(): { user: string; pass: string }[] {
  const users: { user: string; pass: string }[] = [];
  const u1 = process.env.ADMIN_USER_1;
  const p1 = process.env.ADMIN_PASS_1;
  const u2 = process.env.ADMIN_USER_2;
  const p2 = process.env.ADMIN_PASS_2;
  if (u1 && p1) users.push({ user: u1, pass: p1 });
  if (u2 && p2) users.push({ user: u2, pass: p2 });
  return users;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET no configurado");
  }
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(data: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function verifyAdminCredentials(user: string, pass: string): boolean {
  return getAdminUsers().some((u) => timingSafeEqual(u.user, user) && timingSafeEqual(u.pass, pass));
}

export async function createAdminSessionToken(user: string): Promise<string> {
  const payload: AdminSessionPayload = { user, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmac(payloadB64, getSecret());
  const sigB64 = base64UrlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = base64UrlEncode(await hmac(payloadB64, getSecret()));
  if (!timingSafeEqual(expectedSig, sigB64)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as AdminSessionPayload;
    if (Date.now() > payload.exp) return null;
    return payload.user;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

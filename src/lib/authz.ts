import { auth } from "@/lib/auth";

export type Role = "admin" | "doctor" | "patient";
export type AuthedUser = { id: string; email: string; role: Role; name: string };

export class HttpError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

const ROLES: readonly Role[] = ["admin", "doctor", "patient"];

/** Throws HttpError(401) when there is no valid, unbanned session. */
export async function requireSession(request: Request): Promise<AuthedUser> {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
  const u = session?.user as (Record<string, unknown> | undefined);
  if (!u || u.banned === true) throw new HttpError(401, "unauthenticated");
  const role = ROLES.includes(u.role as Role) ? (u.role as Role) : "patient";
  return { id: String(u.id), email: String(u.email).trim().toLowerCase(), role, name: String(u.name ?? "") };
}

/** Throws 401 if not signed in, 403 if signed in with the wrong role. */
export async function requireRole(request: Request, allowed: readonly Role[]): Promise<AuthedUser> {
  const user = await requireSession(request);
  if (!allowed.includes(user.role)) throw new HttpError(403, "forbidden");
  return user;
}

export const isStaff = (u: AuthedUser) => u.role === "admin" || u.role === "doctor";

/**
 * Resolves which patient email a request may act on.
 * Patients: always their own email. If they pass someone else's, throw 404, not 403, so the endpoint can't confirm another patient exists.
 * Staff: must pass an explicit email.
 */
export function resolvePatientEmail(user: AuthedUser, requested: string | null | undefined): string {
  const wanted = requested?.trim().toLowerCase() || null;
  if (isStaff(user)) {
    if (!wanted) throw new HttpError(400, "email_required");
    return wanted;
  }
  if (wanted && wanted !== user.email) throw new HttpError(404, "not_found");
  return user.email;
}

import { ClinicError } from "@/data/clinic-repository";
import type { ErrorKey } from "@/i18n/dictionaries";

// Repository failures carry stable codes so messages follow the active language.
export function errorKeyFrom(cause: unknown, fallback: ErrorKey): ErrorKey {
  return cause instanceof ClinicError ? (cause.code as ErrorKey) : fallback;
}

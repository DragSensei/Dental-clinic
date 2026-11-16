import { ClinicError } from "@/data/clinic-repository";
import { dictionaries, type ErrorKey } from "@/i18n/dictionaries";

// Repository failures carry stable codes so messages follow the active language.
export function errorKeyFrom(cause: unknown, fallback: ErrorKey): ErrorKey {
  if (!(cause instanceof ClinicError)) return fallback;
  if ((cause.code as string) === "invalid_input") return "invalid_contact";
  if (cause.code in dictionaries.en.errors) return cause.code as ErrorKey;
  return fallback;
}

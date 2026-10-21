import test from "node:test";
import assert from "node:assert/strict";

const { dictionaries } = await import("./dictionaries/index.ts");
const { interpolate, formatUtcDate } = await import("./format.ts");
const { services } = await import("../data/mock/catalog.ts");
const { localizedService } = await import("../data/mock/localized-copy.ts");

function leaves(value, path = []) {
  if (Array.isArray(value)) return value.flatMap((item, index) => leaves(item, [...path, index]));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => leaves(item, [...path, key]));
  return [[path.join("."), value]];
}

test("Arabic dictionary has the same keys as English, each with a non-empty translation", () => {
  const english = new Map(leaves(dictionaries.en));
  const arabic = new Map(leaves(dictionaries.ar));
  assert.deepEqual([...arabic.keys()], [...english.keys()]);
  for (const [key, value] of arabic) assert.ok(String(value).trim().length > 0, `${key} must not be empty`);
});

test("interpolation placeholders are preserved in every Arabic string", () => {
  const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",");
  const arabic = new Map(leaves(dictionaries.ar));
  for (const [key, value] of leaves(dictionaries.en)) {
    if (typeof value !== "string") continue;
    assert.equal(placeholders(arabic.get(key)), placeholders(value), `${key} placeholders`);
  }
});

test("interpolate replaces known placeholders and keeps unknown ones", () => {
  assert.equal(interpolate("{count} minutes · {title}", { count: 30, title: "Checks" }), "30 minutes · Checks");
  assert.equal(interpolate("Hello {name}", {}), "Hello {name}");
});

test("UTC dates follow the active language and use Western digits in Arabic", () => {
  const options = { weekday: "long", month: "long", day: "numeric" };
  const english = formatUtcDate("2026-10-22", "en", options);
  const arabic = formatUtcDate("2026-10-22", "ar", options);
  assert.match(english, /Thursday/);
  assert.match(arabic, /[؀-ۿ]/);
  assert.match(arabic, /22/);
  assert.doesNotMatch(arabic, /[٠-٩]/);
});

test("seeded catalog copy is translated, while staff-edited text is shown as entered", () => {
  const seed = services[0];
  assert.equal(localizedService(seed, "ar").title, "الفحوصات الدورية");
  assert.equal(localizedService(seed, "en").title, seed.title);
  assert.equal(localizedService({ ...seed, title: "Staff-entered title" }, "ar").title, "Staff-entered title");
});

test("every clinic error code has an English and an Arabic message", () => {
  const codes = [
    "service_clinician_mismatch", "invalid_contact", "slot_unavailable", "appointment_not_found",
    "confirmed_not_found", "time_unavailable", "invalid_service", "service_not_found",
    "duration_overlap", "invalid_doctor", "doctor_not_found", "doctor_service_blocked",
  ];
  for (const code of codes) {
    assert.ok(dictionaries.en.errors[code], `en ${code}`);
    assert.ok(dictionaries.ar.errors[code], `ar ${code}`);
  }
});

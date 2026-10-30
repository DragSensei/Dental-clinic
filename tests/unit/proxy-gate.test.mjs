import test from "node:test";
import assert from "node:assert/strict";
import { decideGate } from "../../src/proxy.ts";

test("decideGate matrix for logged-out visitor (null role)", () => {
  assert.deepEqual(decideGate("/admin", null), { kind: "notFound" });
  assert.deepEqual(decideGate("/admin/overview", null), { kind: "notFound" });
  assert.deepEqual(decideGate("/admin/login", null), { kind: "redirect", to: "/login" });
  assert.deepEqual(decideGate("/patient/overview", null), { kind: "notFound" });
  assert.deepEqual(decideGate("/login", null), { kind: "next" });
});

test("decideGate matrix for patient role", () => {
  assert.deepEqual(decideGate("/admin", "patient"), { kind: "notFound" });
  assert.deepEqual(decideGate("/admin/overview", "patient"), { kind: "notFound" });
  assert.deepEqual(decideGate("/admin/login", "patient"), { kind: "redirect", to: "/patient/overview" });
  assert.deepEqual(decideGate("/patient/overview", "patient"), { kind: "next" });
  assert.deepEqual(decideGate("/login", "patient"), { kind: "redirect", to: "/patient/overview" });
});

test("decideGate matrix for doctor role", () => {
  assert.deepEqual(decideGate("/admin", "doctor"), { kind: "notFound" });
  assert.deepEqual(decideGate("/admin/overview", "doctor"), { kind: "next" });
  assert.deepEqual(decideGate("/admin/login", "doctor"), { kind: "redirect", to: "/admin/overview" });
  assert.deepEqual(decideGate("/patient/overview", "doctor"), { kind: "notFound" });
  assert.deepEqual(decideGate("/login", "doctor"), { kind: "redirect", to: "/admin/overview" });
});

test("decideGate matrix for admin role", () => {
  assert.deepEqual(decideGate("/admin", "admin"), { kind: "notFound" });
  assert.deepEqual(decideGate("/admin/overview", "admin"), { kind: "next" });
  assert.deepEqual(decideGate("/admin/login", "admin"), { kind: "redirect", to: "/admin/overview" });
  assert.deepEqual(decideGate("/patient/overview", "admin"), { kind: "notFound" });
  assert.deepEqual(decideGate("/login", "admin"), { kind: "redirect", to: "/admin/overview" });
});

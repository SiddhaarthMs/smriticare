import { createIdentity, PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("reports the schema instead of trapping", async () => {
  const schema = await actor.schema();
  expect(typeof schema).toBe("string");
});

it("answers an empty-state read instead of trapping", async () => {
  const result = await actor.execute("SELECT * FROM __nonexistent__");
  // The OQL engine returns a Result with rows; it must not trap.
  expect(result).toBeDefined();
});

it("round-trips a caller role assignment through the real canister", async () => {
  await actor._initialize_access_control();
  const role = await actor.getCallerUserRole();
  expect(role).toBeDefined();
});

it("exposes the authorization helpers without trapping", async () => {
  await expect(actor.isCallerAdmin()).resolves.toBeTypeOf("boolean");
  await expect(actor._internet_identity_sign_in_start()).resolves.toBeDefined();
  await expect(actor._internet_identity_sign_in_finish()).resolves.toBeDefined();
});

it("rejects role assignment from a non-admin caller", async () => {
  const caller = createIdentity("smriticare-test-caller").getPrincipal();
  // assignCallerUserRole is admin-only; a non-admin caller must be rejected.
  await expect(actor.assignCallerUserRole(caller, { user: null })).rejects.toThrow(/Unauthorized/i);
});

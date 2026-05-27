import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { findAvailablePort } from "../server/ports.mjs";

test("findAvailablePort returns the requested port when it is free", async () => {
  const port = await findAvailablePort(0);
  assert.equal(typeof port, "number");
  assert.ok(port > 0);
});

test("findAvailablePort skips a busy port", async () => {
  const blocker = createServer((req, res) => res.end("busy"));
  await new Promise((resolve) => blocker.listen(0, resolve));
  const busyPort = blocker.address().port;

  try {
    const port = await findAvailablePort(busyPort, 5);
    assert.notEqual(port, busyPort);
    assert.ok(port > busyPort);
  } finally {
    await new Promise((resolve) => blocker.close(resolve));
  }
});

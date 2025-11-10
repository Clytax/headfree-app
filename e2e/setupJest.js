// e2e/setupJest.js
// This uses Detox's provided Jest adapter to install the Detox worker
// and wire lifecycle hooks. It avoids messing with internals and works
// across Detox versions that include the runners/jest adapter.

const adapterPath = "detox/runners/jest/adapter";

let adapter;
try {
  adapter = require(adapterPath);
} catch (err) {
  console.error(
    `[setupJest] failed to require(${adapterPath}):`,
    err && err.stack ? err.stack : err
  );
  throw err;
}

// Make sure tests don't timeout while waiting for device lifecycle
jest.setTimeout(120000);

// Adapter exposes lifecycle hooks used by Detox' runner
beforeAll(async () => {
  if (typeof adapter.beforeAll === "function") {
    await adapter.beforeAll();
  } else {
    throw new Error("Detox Jest adapter missing beforeAll");
  }
});

beforeEach(async () => {
  if (typeof adapter.beforeEach === "function") {
    await adapter.beforeEach();
  }
});

afterAll(async () => {
  if (typeof adapter.afterAll === "function") {
    await adapter.afterAll();
  }
});

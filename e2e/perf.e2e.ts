// e2e/perf.e2e.ts
/**
 * Robust Detox init probe + perf loop.
 *
 * Usage:
 *   node collector.js
 *   COLD_RUNS=5 WARM_RUNS=5 npx detox test -c ios.release e2e/perf.e2e.ts --headless
 *
 * This test will attempt to locate detox.init/cleanup on whatever shape your
 * installed detox package exports, print helpful diagnostics, and then proceed.
 */

const DETOX_REQ = require("detox");

// Probe exports for debugging
console.log("[DETox-EXPORTS] keys:", Object.keys(DETOX_REQ));
if (typeof DETOX_REQ === "function") {
  console.log("[DETox-EXPORTS] detox is a function");
}
if (DETOX_REQ && DETOX_REQ.default) {
  console.log(
    "[DETox-EXPORTS] detox.default keys:",
    Object.keys(DETOX_REQ.default || {})
  );
}

// try a few common places where init/cleanup may live
const maybeInit =
  ((DETox) => (typeof DETox.init === "function" ? DETox.init : undefined))(
    DETOX_REQ
  ) ||
  ((DETox) =>
    DETox &&
    typeof Detox.default === "object" &&
    typeof Detox.default.init === "function"
      ? Detox.default.init
      : undefined)(DETOX_REQ) || // safe guard
  ((DETox) =>
    DETox &&
    typeof Detox.detox === "object" &&
    typeof Detox.detox.init === "function"
      ? Detox.detox.init
      : undefined)(DETOX_REQ) ||
  ((DETox) =>
    typeof DETox === "function" && typeof DETox.init === "function"
      ? Detox.init
      : undefined)(DETOX_REQ);

// But above lambda used wrong var names for readability — do safe explicit checks:
let initFn = undefined;
let cleanupFn = undefined;
let device = undefined;

try {
  if (typeof DETOX_REQ.init === "function") {
    initFn = DETOX_REQ.init;
    cleanupFn = DETOX_REQ.cleanup;
    device =
      DETOX_REQ.device ||
      (DETOX_REQ as any).Device ||
      (DETOX_REQ as any).device;
  } else if (DETOX_REQ && DETOX_REQ.default) {
    if (typeof DETOX_REQ.default.init === "function") {
      initFn = DETOX_REQ.default.init;
      cleanupFn = DETOX_REQ.default.cleanup;
      device =
        DETOX_REQ.default.device ||
        DETOX_REQ.default.Device ||
        DETOX_REQ.default.device;
    }
  } else if (DETOX_REQ && DETOX_REQ.detox) {
    if (typeof DETOX_REQ.detox.init === "function") {
      initFn = DETOX_REQ.detox.init;
      cleanupFn = DETOX_REQ.detox.cleanup;
      device =
        DETOX_REQ.detox.device ||
        DETOX_REQ.detox.Device ||
        DETOX_REQ.detox.device;
    }
  }
} catch (err) {
  console.log("[DETox-PROBE] probe error", err && err.stack ? err.stack : err);
}

// final fallback: try requiring inner modules (best-effort, won't always exist)
if (!initFn) {
  try {
    // Some versions expose runtime in internal modules — try a few safe paths
    const alt = require("detox/src/index.js"); // may throw
    if (alt && typeof alt.init === "function") {
      initFn = alt.init;
      cleanupFn = alt.cleanup;
      device = alt.device || device;
      console.log("[DETox-PROBE] found init in detox/src/index.js");
    }
  } catch (e) {
    // ignore
  }
}

if (!initFn) {
  // helpful diagnostic and explicit failure so you can paste the result
  console.error(
    "ERROR: Could not locate detox.init on the installed package. Diagnostic info:\n" +
      `- require('detox') keys: ${JSON.stringify(Object.keys(DETOX_REQ))}\n` +
      `- typeof require('detox'): ${typeof DETOX_REQ}\n` +
      `- typeof require('detox').default: ${
        DETOX_REQ && DETOX_REQ.default ? typeof DETOX_REQ.default : "n/a"
      }\n` +
      "Please paste this block into the chat so I can suggest the exact require path for your Detox version."
  );
  // fail the test explicitly so Jest reports the message
  throw new Error("detox.init not found — see console for diagnostics above");
}

// Ensure we have the device handle too
if (!device) {
  // try to obtain device from the top-level require again
  device =
    DETOX_REQ.device ||
    (DETOX_REQ.default && DETOX_REQ.default.device) ||
    (DETOX_REQ.detox && DETOX_REQ.detox.device);
}

if (!device) {
  console.warn(
    "[DETox-PROBE] Warning: device handle was not found on the detox export. You may still get runtime errors."
  );
}

// main test (same cold/warm loop)
const COLD_RUNS = Number(process.env.COLD_RUNS ?? 5);
const WARM_RUNS = Number(process.env.WARM_RUNS ?? 5);
const PAUSE_BETWEEN_MS = Number(process.env.PAUSE_BETWEEN_MS ?? 800);

jest.setTimeout(1000 * 60 * 30);

describe("collect perf", () => {
  beforeAll(async () => {
    console.log("[DETox-PROBE] calling initFn:", typeof initFn);
    await initFn(); // call whichever init we found
  }, 120000);

  afterAll(async () => {
    try {
      if (typeof cleanupFn === "function") {
        await cleanupFn();
      } else if (typeof DETOX_REQ.cleanup === "function") {
        await DETOX_REQ.cleanup();
      } else if (
        DETOX_REQ &&
        DETOX_REQ.default &&
        typeof DETOX_REQ.default.cleanup === "function"
      ) {
        await DETOX_REQ.default.cleanup();
      } else {
        console.log("[DETox-PROBE] no cleanupFn available, skipping cleanup");
      }
    } catch (err) {
      console.warn(
        "[DETox-PROBE] cleanup error",
        err && err.stack ? err.stack : err
      );
    }
  }, 60000);

  test("cold and warm start loops", async () => {
    // Use the device we found if available; else attempt to require it fresh
    let theDevice = device;
    if (!theDevice) {
      try {
        const maybe =
          require("detox").device ||
          (require("detox").default && require("detox").default.device);
        theDevice = maybe;
      } catch (e) {
        // ignore
      }
    }

    if (!theDevice) {
      throw new Error(
        "device not available after init; cannot run launches. See earlier logs."
      );
    }

    for (let i = 1; i <= COLD_RUNS; i++) {
      try {
        await theDevice.terminateApp();
      } catch (e) {}
      await theDevice.launchApp({
        newInstance: true,
        launchArgs: { perfRun: i, cold: "1" },
      });
      await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_MS));
    }

    for (let i = 1; i <= WARM_RUNS; i++) {
      try {
        await theDevice.sendToHome();
        await new Promise((r) => setTimeout(r, 200));
        await theDevice.launchApp({
          newInstance: false,
          launchArgs: { perfRun: i, cold: "0" },
        });
      } catch (e) {
        await theDevice.launchApp({
          newInstance: false,
          launchArgs: { perfRun: i, cold: "0" },
        });
      }
      await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_MS));
    }

    await new Promise((r) => setTimeout(r, 1500));
  });
});

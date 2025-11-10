// e2e/jest.config.js
// Minimal Jest config for Detox perf runs.
// Import Detox config object and then override only what's necessary
// to run the simple e2e perf test locally (no Allure, no internal setup).
const path = require("path");

// Load detox shipped jest config
const detoxConfig = require("detox/jest.config.js");

// Resolve project root from current working directory
const PROJECT_ROOT = process.cwd();
const E2E_DIR = path.join(PROJECT_ROOT, "e2e");

// Force sensible, absolute roots and avoid undefined __dirname issues
detoxConfig.rootDir = PROJECT_ROOT;

// Remove any detox setup files that expect a different root layout
detoxConfig.setupFiles = [];

// Use node environment to avoid optional reporters/env dependencies
detoxConfig.testEnvironment = "node";

// Minimal reporters
detoxConfig.reporters = ["default"];

// Limit tests to e2e folder
detoxConfig.roots = [E2E_DIR];
detoxConfig.testMatch = ["**/?(*.)+(e2e).[tj]s?(x)"];

// Timeouts appropriate for device tests
detoxConfig.testTimeout = 120000;

module.exports = detoxConfig;

const z = require("zod");

const path = require("path");
const APP_ENV = process.env.APP_ENV ?? "development";
const envPath = path.resolve(path.dirname(), `.env.${APP_ENV}`);

require("dotenv").config({
  path: envPath,
});

import assert from "node:assert/strict";
import { log } from "node:console";
import { readdirSync, readFileSync } from "node:fs";

const entries = readdirSync("dist/js").filter((file) =>
  /^app\.[a-z0-9]+\.js$/.test(file),
);
assert.equal(
  entries.length,
  1,
  "nginx entrypoint requires exactly one hashed js/app.*.js",
);
const html = readFileSync("dist/index.html", "utf8");
assert.ok(
  html.includes(`js/${entries[0]}`),
  "HTML must load the generated entrypoint",
);
assert.ok(
  !html.includes('rel="prefetch"'),
  "QR scanner must not be prefetched on the upload screen",
);
log("Build output matches nginx entrypoint and lazy scanner contract.");

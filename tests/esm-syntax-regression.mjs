import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function collectJavaScript(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScript(fullPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [fullPath] : [];
  });
}

const files = collectJavaScript(path.join(root, "src"));
assert.ok(files.length > 0, "No JavaScript source files found");

for (const file of files) {
  const result = spawnSync(process.execPath, ["--input-type=module", "--check"], {
    input: fs.readFileSync(file),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${path.relative(root, file)}\n${result.stderr}`);
}

console.log(`ABYSS DOMINION ESM syntax regression: PASS (${files.length} files)`);

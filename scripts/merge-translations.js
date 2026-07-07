// Refreshes translations/en.json: the "package" section (package.json contribution
// strings) is hand-maintained and preserved as-is; the "runtime" section is fully
// regenerated from a fresh scan of t(...) calls in src/, so it can never drift from
// what the code actually uses. Run this after adding a new command/setting (edit the
// "package" section by hand) or after adding new t(...) calls in source.
const fs = require("fs");
const path = require("path");
const { extractRuntimeMessages } = require("./lib/extractRuntimeMessages");

const ROOT = path.join(__dirname, "..");
const SRC_ROOT = path.join(ROOT, "src");
const TRANSLATIONS_DIR = path.join(ROOT, "translations");
const outPath = path.join(TRANSLATIONS_DIR, "en.json");

let pkg = {};
if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
    pkg = existing.package || {};
} else {
    console.warn("translations/en.json not found yet - starting with an empty \"package\" section; fill it in by hand.");
}

const runtime = extractRuntimeMessages(SRC_ROOT);

const merged = { package: pkg, runtime };

fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n", "utf8");

console.log(`Wrote translations/en.json (${Object.keys(pkg).length} package keys, ${Object.keys(runtime).length} runtime messages)`);

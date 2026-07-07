// Dev convenience: scans src/ for t(...) calls and writes l10n/bundle.l10n.json
// directly (without going through translations/en.json). Mainly useful for a
// quick look at what's currently extracted; the real pipeline is
// translations/en.json -> (split-translations|generate-all-translations).
const fs = require("fs");
const path = require("path");
const { extractRuntimeMessages } = require("./lib/extractRuntimeMessages");

const SRC_ROOT = path.join(__dirname, "..", "src");
const OUT_DIR = path.join(__dirname, "..", "l10n");

const messages = extractRuntimeMessages(SRC_ROOT);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "bundle.l10n.json"), JSON.stringify(messages, null, 4) + "\n", "utf8");

console.log(`Wrote ${Object.keys(messages).length} messages to l10n/bundle.l10n.json`);

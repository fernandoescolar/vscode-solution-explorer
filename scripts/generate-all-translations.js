// Generates package.nls[.<locale>].json and l10n/bundle.l10n[.<locale>].json for
// every translations/<locale>.json file in the repo. These outputs are build
// artifacts (gitignored, not committed) - this runs automatically before
// "compile" and "vscode:prepublish" (see package.json's pre* scripts) so they
// always exist by the time the extension is loaded or packaged.
const fs = require("fs");
const path = require("path");
const { splitLocale, TRANSLATIONS_DIR } = require("./lib/splitLocale");

if (!fs.existsSync(TRANSLATIONS_DIR)) {
    console.error(`Not found: ${path.relative(path.join(__dirname, ".."), TRANSLATIONS_DIR)}`);
    process.exit(1);
}

const locales = fs.readdirSync(TRANSLATIONS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(/\.json$/, ""));

if (locales.length === 0) {
    console.error("No translations/*.json files found.");
    process.exit(1);
}

locales.forEach(locale => {
    const result = splitLocale(locale);
    console.log(`[${locale}] ${result.packageNlsPath} (${result.packageCount} keys), ${result.bundlePath} (${result.runtimeCount} keys)`);
});

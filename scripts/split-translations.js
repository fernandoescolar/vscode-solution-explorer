// Splits translations/<locale>.json into package.nls[.<locale>].json and
// l10n/bundle.l10n[.<locale>].json for a single locale.
// Usage: node scripts/split-translations.js <locale>   (e.g. en, es)
const { splitLocale } = require("./lib/splitLocale");

const locale = process.argv[2];
if (!locale) {
    console.error("Usage: node scripts/split-translations.js <locale>");
    process.exit(1);
}

try {
    const result = splitLocale(locale);
    console.log(`Wrote ${result.packageNlsPath} (${result.packageCount} keys) and ${result.bundlePath} (${result.runtimeCount} keys)`);
} catch (e) {
    console.error(e.message);
    process.exit(1);
}

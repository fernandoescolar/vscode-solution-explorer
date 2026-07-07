// Splits translations/<locale>.json into the two build artifacts VS Code actually
// reads: package.nls[.<locale>].json and l10n/bundle.l10n[.<locale>].json.
// These are generated files, not committed to the repo (see .gitignore).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const TRANSLATIONS_DIR = path.join(ROOT, "translations");

function splitLocale(locale) {
    const sourcePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Not found: translations/${locale}.json`);
    }

    const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    const pkg = data.package || {};
    const runtime = data.runtime || {};

    const isBase = locale === "en";
    const packageNlsPath = path.join(ROOT, isBase ? "package.nls.json" : `package.nls.${locale}.json`);
    const bundlePath = path.join(ROOT, "l10n", isBase ? "bundle.l10n.json" : `bundle.l10n.${locale}.json`);

    fs.writeFileSync(packageNlsPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
    fs.writeFileSync(bundlePath, JSON.stringify(runtime, null, 4) + "\n", "utf8");

    if (!isBase) {
        const basePath = path.join(TRANSLATIONS_DIR, "en.json");
        if (fs.existsSync(basePath)) {
            const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
            const missingPkg = Object.keys(base.package || {}).filter(k => !(k in pkg));
            const missingRuntime = Object.keys(base.runtime || {}).filter(k => !(k in runtime));
            if (missingPkg.length || missingRuntime.length) {
                console.warn(`Warning: translations/${locale}.json is missing keys present in translations/en.json`);
                if (missingPkg.length) { console.warn("  package:", missingPkg.join(", ")); }
                if (missingRuntime.length) { console.warn("  runtime:", missingRuntime.join(", ")); }
            }
        }
    }

    return {
        packageNlsPath: path.relative(ROOT, packageNlsPath),
        bundlePath: path.relative(ROOT, bundlePath),
        packageCount: Object.keys(pkg).length,
        runtimeCount: Object.keys(runtime).length
    };
}

module.exports = { splitLocale, TRANSLATIONS_DIR };

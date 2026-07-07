// Scans src/ for t(...) calls (src/extensions/translations.ts's wrapper around
// vscode.l10n.t) and returns the set of English messages found. @vscode/l10n-dev's
// own CLI only recognizes vscode.l10n.t(...)/@vscode/l10n call patterns, not custom
// wrapper names, so it can't be used directly for this.
const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, files);
        } else if (entry.name.endsWith(".ts")) {
            files.push(full);
        }
    }
    return files;
}

const tCallRegex = /\bt\(\s*(["'])((?:\\.|(?!\1).)*)\1/g;

function extractRuntimeMessages(srcRoot) {
    const messages = new Set();
    walk(srcRoot).forEach(file => {
        if (file.endsWith(path.join("extensions", "translations.ts"))) { return; }
        const content = fs.readFileSync(file, "utf8");
        let match;
        while ((match = tCallRegex.exec(content)) !== null) {
            messages.add(match[2].replace(/\\(.)/g, "$1"));
        }
    });

    const result = {};
    Array.from(messages).sort().forEach(m => result[m] = m);
    return result;
}

module.exports = { extractRuntimeMessages };

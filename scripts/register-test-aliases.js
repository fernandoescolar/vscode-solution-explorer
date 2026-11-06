// Preloaded by test:unit. tsc checks the "paths" in tsconfig.tests.json but does
// not rewrite them in its output, and webpack (which handles the aliases in the
// real build) isn't involved in the tests, so "@extensions/*" is resolved here.
const Module = require("module");
const path = require("path");

const EXTENSIONS_ROOT = path.join(__dirname, "..", ".tmp-tests", "src", "extensions");
const PREFIX = "@extensions/";

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
    const target = request.startsWith(PREFIX)
        ? path.join(EXTENSIONS_ROOT, request.slice(PREFIX.length))
        : request;
    return resolveFilename.call(this, target, ...rest);
};

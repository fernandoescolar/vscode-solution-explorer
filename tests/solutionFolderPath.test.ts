declare const require: (name: string) => any;

const assert = require("assert/strict");
const test = require("node:test");
import { SolutionFolderNode, getSolutionFolderCandidatePaths, getSolutionFolderSegments } from "../src/core/Solutions/SolutionFolderPath";

// Mirrors the hierarchy built by the .sln/.slnx loaders:
// the solution is the root (no parent) and solution folders hang from it.
function createSolution(): SolutionFolderNode {
    return { name: "CleanArchitecture", parent: undefined };
}

function createFolder(name: string, parent: SolutionFolderNode): SolutionFolderNode {
    return { name, parent };
}

test("getSolutionFolderSegments returns only the folder name for a root solution folder", () => {
    const solution = createSolution();
    const app = createFolder("app", solution);

    assert.deepEqual(getSolutionFolderSegments(app), ["app"]);
});

test("getSolutionFolderSegments returns the full nested path without the solution name", () => {
    const solution = createSolution();
    const app = createFolder("app", solution);
    const src = createFolder("src", app);
    const api = createFolder("Api", src);

    assert.deepEqual(getSolutionFolderSegments(src), ["app", "src"]);
    assert.deepEqual(getSolutionFolderSegments(api), ["app", "src", "Api"]);
});

test("getSolutionFolderCandidatePaths returns a single candidate for a root solution folder", () => {
    const solution = createSolution();
    const app = createFolder("app", solution);

    assert.deepEqual(getSolutionFolderCandidatePaths(app), [["app"]]);
});

test("getSolutionFolderCandidatePaths prefers the nested path and keeps the folder name as fallback", () => {
    const solution = createSolution();
    const app = createFolder("app", solution);
    const src = createFolder("src", app);

    assert.deepEqual(getSolutionFolderCandidatePaths(src), [["app", "src"], ["src"]]);
});

test("getSolutionFolderCandidatePaths handles an item without parent", () => {
    const orphan: SolutionFolderNode = { name: "orphan", parent: undefined };

    assert.deepEqual(getSolutionFolderSegments(orphan), []);
    assert.deepEqual(getSolutionFolderCandidatePaths(orphan), [["orphan"]]);
});

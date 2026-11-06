export interface SolutionFolderNode {
    name: string;
    parent: SolutionFolderNode | undefined;
}

/**
 * Returns the names of a solution folder and all its parent solution folders,
 * from the outermost to the innermost one.
 *
 * The solution itself is the root of the hierarchy (it has no parent),
 * so it is not included.
 *
 * Example: for the solution folder "/app/src/" it returns ["app", "src"].
 */
export function getSolutionFolderSegments(item: SolutionFolderNode): string[] {
    const segments: string[] = [];
    let current: SolutionFolderNode | undefined = item;
    while (current && current.parent) {
        segments.unshift(current.name);
        current = current.parent;
    }

    return segments;
}

/**
 * Returns the relative paths (as segments) that may contain the physical
 * directory of a solution folder, in order of preference:
 *   1. the full nested path (e.g. ["app", "src"])
 *   2. only the folder name (e.g. ["src"]), kept for backwards compatibility
 */
export function getSolutionFolderCandidatePaths(item: SolutionFolderNode): string[][] {
    const nested = getSolutionFolderSegments(item);
    if (nested.length <= 1) {
        return [ [ item.name ] ];
    }

    return [ nested, [ item.name ] ];
}

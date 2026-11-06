import * as path from "../../extensions/path";
import type { SolutionFolder, SolutionItem } from "./model";

export function normalizePath(filepath: string): string {
    const resolved = path.resolve(filepath);
    return process.platform === 'win32' ? resolved.toLocaleLowerCase() : resolved;
}

export function isSamePath(a: string | undefined, b: string | undefined): boolean {
    if (!a || !b) { return false; }
    return normalizePath(a) === normalizePath(b);
}

export function isStartupProjectPath(item: SolutionItem, startupProject: SolutionItem | undefined): boolean {
    if (!startupProject) { return false; }

    const folder = item as SolutionFolder;
    if (typeof folder.getFolders === 'function') {
        return startupProject.getFullDisplayName().startsWith(item.getFullDisplayName() + path.sep);
    }

    return isSamePath(item.fullPath, startupProject.fullPath);
}

export function compareSolutionItems(a: SolutionItem, b: SolutionItem, startupProject: SolutionItem | undefined): number {
    const aIsStartupPath = isStartupProjectPath(a, startupProject);
    const bIsStartupPath = isStartupProjectPath(b, startupProject);
    if (aIsStartupPath !== bIsStartupPath) { return aIsStartupPath ? -1 : 1; }

    const x = a.name.toLowerCase();
    const y = b.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
}

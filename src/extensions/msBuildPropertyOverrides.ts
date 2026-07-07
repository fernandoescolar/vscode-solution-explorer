import * as vscode from "vscode";

const STORAGE_KEY = "msBuildPropertyOverrides";

let state: vscode.Memento | undefined;

export function register(context: vscode.ExtensionContext): void {
    state = context.workspaceState;
}

function normalize(fullPath: string): string {
    return fullPath.toLocaleLowerCase();
}

function getAll(): Record<string, Record<string, string>> {
    return state?.get<Record<string, Record<string, string>>>(STORAGE_KEY, {}) ?? {};
}

export function getOverrides(fullPath: string): Record<string, string> {
    return getAll()[normalize(fullPath)] ?? {};
}

export async function setOverrides(fullPath: string, overrides: Record<string, string>): Promise<void> {
    const all = getAll();
    all[normalize(fullPath)] = overrides;
    await state?.update(STORAGE_KEY, all);
}

// project-level overrides win over solution-level ones, which win over
// whatever the reader would otherwise default to (vssolution.defaultMsBuild*)
export function getEffectiveOverrides(projectFullPath: string, solutionFullPath?: string): Record<string, string> {
    const solutionOverrides = solutionFullPath ? getOverrides(solutionFullPath) : {};
    const projectOverrides = getOverrides(projectFullPath);
    return { ...solutionOverrides, ...projectOverrides };
}

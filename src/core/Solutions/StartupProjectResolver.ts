import * as path from "../../extensions/path";

export type PathResolver = (value: string) => string | undefined;

export interface LaunchConfigurationLike {
    project?: unknown;
    program?: unknown;
    cwd?: unknown;
}

export interface LaunchSettingsEntry {
    projectPath: string;
    launchSettings: unknown;
}

function asPath(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function normalize(filepath: string): string {
    const resolved = path.resolve(filepath);
    return process.platform === 'win32' ? resolved.toLocaleLowerCase() : resolved;
}

function isSamePath(a: string, b: string): boolean {
    return normalize(a) === normalize(b);
}

function isInside(filePath: string, directory: string): boolean {
    const relative = path.relative(directory, filePath);
    return relative.length > 0
        && !relative.startsWith('..')
        && !path.isAbsolute(relative);
}

export function resolveLaunchPath(value: string, workspaceFolderPath: string, findWorkspaceFolder: (name: string) => string | undefined): string | undefined {
    const replaced = value.replace(/\$\{(?:workspaceFolder|workspaceRoot)(?::([^}]+))?\}/gi,
        (match: string, folderName: string | undefined) => {
            if (!folderName) { return workspaceFolderPath; }

            // keep the variable when the folder is unknown so the check below rejects the path
            return findWorkspaceFolder(folderName) ?? match;
        });

    if (/\$\{[^}]+\}/.test(replaced)) { return undefined; }

    const resolved = path.isAbsolute(replaced) ? replaced : path.join(workspaceFolderPath, replaced);
    return path.resolve(resolved);
}

export function findProjectContainingPath(projectPaths: string[], filePath: string): string | undefined {
    let result: string | undefined;
    for (const projectPath of projectPaths) {
        const projectDirectory = path.dirname(projectPath);
        if (!isSamePath(projectDirectory, filePath) && !isInside(filePath, projectDirectory)) {
            continue;
        }

        if (!result || projectDirectory.length > path.dirname(result).length) {
            result = projectPath;
        }
    }

    return result;
}

export function findProjectFromLaunchConfiguration(configuration: unknown, resolvePath: PathResolver, projectPaths: string[]): string | undefined {
    if (!configuration || typeof configuration !== 'object') { return undefined; }
    const config = configuration as LaunchConfigurationLike;

    const project = asPath(config.project);
    const program = asPath(config.program);
    const cwd = asPath(config.cwd);
    if (!project && !program && !cwd) { return undefined; }

    const resolvedProject = project ? resolvePath(project) : undefined;
    const resolvedProgram = program ? resolvePath(program) : undefined;
    const resolvedCwd = cwd ? resolvePath(cwd) : undefined;

    // every declared path field has to resolve, otherwise the configuration is ambiguous
    if ((project && !resolvedProject) || (program && !resolvedProgram) || (cwd && !resolvedCwd)) {
        return undefined;
    }

    if (resolvedProject) {
        const exact = projectPaths.find(p => isSamePath(p, resolvedProject));
        if (exact) { return exact; }

        const inDirectory = projectPaths.find(p => isSamePath(path.dirname(p), resolvedProject));
        if (inDirectory) { return inDirectory; }
    }

    if (resolvedProgram) {
        const containing = findProjectContainingPath(projectPaths, resolvedProgram);
        if (containing) { return containing; }
    }

    if (resolvedCwd) {
        const exactDirectory = projectPaths.find(p => isSamePath(path.dirname(p), resolvedCwd));
        if (exactDirectory) { return exactDirectory; }
    }

    return undefined;
}

export function findStartupProjectFromLaunchConfigurations(configurations: unknown, resolvePath: PathResolver, projectPaths: string[]): string | undefined {
    if (!Array.isArray(configurations)) { return undefined; }

    for (const configuration of configurations) {
        const projectPath = findProjectFromLaunchConfiguration(configuration, resolvePath, projectPaths);
        if (projectPath) { return projectPath; }
    }

    return undefined;
}

export function hasProjectLaunchProfile(launchSettings: unknown): boolean {
    if (!launchSettings || typeof launchSettings !== 'object') { return false; }

    const profiles = (launchSettings as { profiles?: unknown }).profiles;
    if (!profiles || typeof profiles !== 'object') { return false; }

    return Object.values(profiles as Record<string, unknown>).some(profile => {
        if (!profile || typeof profile !== 'object') { return false; }
        const commandName = (profile as { commandName?: unknown }).commandName;
        return typeof commandName === 'string' && commandName.toLowerCase() === 'project';
    });
}

export function findStartupProjectFromLaunchSettings(entries: LaunchSettingsEntry[]): string | undefined {
    return entries.find(entry => hasProjectLaunchProfile(entry.launchSettings))?.projectPath;
}

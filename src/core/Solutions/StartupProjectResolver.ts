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
    if (project) {
        const resolved = resolvePath(project);
        if (resolved) {
            const exact = projectPaths.find(p => isSamePath(p, resolved));
            if (exact) { return exact; }

            const inDirectory = projectPaths.find(p => isSamePath(path.dirname(p), resolved));
            if (inDirectory) { return inDirectory; }
        }
    }

    const program = asPath(config.program);
    if (program) {
        const resolved = resolvePath(program);
        if (resolved) {
            const containing = findProjectContainingPath(projectPaths, resolved);
            if (containing) { return containing; }
        }
    }

    const cwd = asPath(config.cwd);
    if (cwd) {
        const resolved = resolvePath(cwd);
        if (resolved) {
            const exactDirectory = projectPaths.find(p => isSamePath(path.dirname(p), resolved));
            if (exactDirectory) { return exactDirectory; }
        }
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

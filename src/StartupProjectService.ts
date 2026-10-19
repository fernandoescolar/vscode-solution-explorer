import * as vscode from "vscode";
import * as fs from "@extensions/fs";
import * as path from "@extensions/path";
import { Solution } from "@core/Solutions";
import { isSamePath, normalizePath } from "./core/Solutions/SolutionItemSort";
import { LaunchSettingsEntry, findStartupProjectFromLaunchConfigurations, findStartupProjectFromLaunchSettings, resolveLaunchPath } from "./core/Solutions/StartupProjectResolver";

export class StartupProjectService implements vscode.Disposable {
    private readonly startupProjects = new Map<string, string | undefined>();
    private readonly solutionProjects = new Map<string, string[]>();
    private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();
    private readonly onDidInvalidateEmitter = new vscode.EventEmitter<void>();
    private readonly watchers: vscode.FileSystemWatcher[] = [];
    private readonly subscriptions: vscode.Disposable[] = [];
    private generation = 0;

    public readonly onDidChange = this.onDidChangeEmitter.event;
    public readonly onDidInvalidate = this.onDidInvalidateEmitter.event;

    public register(): void {
        this.watchers.push(vscode.workspace.createFileSystemWatcher('**/.vscode/launch.json'));
        this.watchers.push(vscode.workspace.createFileSystemWatcher('**/Properties/launchSettings.json'));
        this.watchers.push(vscode.workspace.createFileSystemWatcher('**/*.{sln,slnx}'));
        for (const watcher of this.watchers) {
            watcher.onDidChange(() => this.invalidate());
            watcher.onDidCreate(() => this.invalidate());
            watcher.onDidDelete(() => this.invalidate());
        }

        this.subscriptions.push(
            vscode.workspace.onDidChangeWorkspaceFolders(() => this.invalidate()),
            // the effective launch configuration may also come from a .code-workspace file or from user settings
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('launch')) {
                    this.invalidate();
                }
            })
        );
    }

    public unregister(): void {
        for (const watcher of this.watchers) {
            watcher.dispose();
        }
        this.watchers.length = 0;

        this.subscriptions.forEach(subscription => subscription.dispose());
        this.subscriptions.length = 0;
    }

    public getStartupProject(solutionPath: string): string | undefined {
        return this.startupProjects.get(normalizePath(solutionPath));
    }

    public isStartupProjectPath(filepath: string): boolean {
        let result = false;
        for (const [solutionKey, projectPaths] of this.solutionProjects) {
            if (!projectPaths.some(projectPath => isSamePath(projectPath, filepath))) { continue; }

            // a project shared by several solutions is only the startup one when no solution disagrees
            const startupProject = this.startupProjects.get(solutionKey);
            if (!startupProject) { continue; }
            if (!isSamePath(startupProject, filepath)) { return false; }

            result = true;
        }

        return result;
    }

    public async resolve(solution: Solution): Promise<void> {
        const key = normalizePath(solution.fullPath);
        if (this.startupProjects.has(key)) { return; }

        const generation = this.generation;
        const projectPaths = solution.getAllProjects()
            .map(project => project.fullPath)
            .filter((projectPath): projectPath is string => !!projectPath);

        const startupProject = await this.detect(solution, projectPaths);
        if (generation !== this.generation) { return; }

        this.solutionProjects.set(key, projectPaths);
        this.startupProjects.set(key, startupProject);
        this.onDidChangeEmitter.fire();
    }

    public dispose(): void {
        this.unregister();
        this.onDidChangeEmitter.dispose();
        this.onDidInvalidateEmitter.dispose();
    }

    private invalidate(): void {
        this.generation++;
        this.startupProjects.clear();
        this.solutionProjects.clear();
        this.onDidInvalidateEmitter.fire();
    }

    private async detect(solution: Solution, projectPaths: string[]): Promise<string | undefined> {
        if (projectPaths.length === 0) { return undefined; }

        const launchProject = this.detectFromLaunch(solution, projectPaths);
        if (launchProject) { return launchProject; }

        return await this.detectFromLaunchSettings(projectPaths);
    }

    private detectFromLaunch(solution: Solution, projectPaths: string[]): string | undefined {
        const solutionUri = vscode.Uri.file(solution.fullPath);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(solutionUri);
        const workspaceFolderPath = workspaceFolder ? workspaceFolder.uri.fsPath : path.dirname(solution.fullPath);
        const configurations = vscode.workspace.getConfiguration('launch', solutionUri).get<unknown>('configurations');

        return findStartupProjectFromLaunchConfigurations(
            configurations,
            value => resolveLaunchPath(value, workspaceFolderPath,
                name => vscode.workspace.workspaceFolders?.find(f => f.name.toLowerCase() === name.toLowerCase())?.uri.fsPath),
            projectPaths);
    }

    private async detectFromLaunchSettings(projectPaths: string[]): Promise<string | undefined> {
        const entries: LaunchSettingsEntry[] = [];
        for (const projectPath of projectPaths) {
            const launchSettingsPath = path.join(path.dirname(projectPath), 'Properties', 'launchSettings.json');
            if (!(await fs.exists(launchSettingsPath))) { continue; }

            try {
                const content = await fs.readFile(launchSettingsPath);
                entries.push({ projectPath, launchSettings: JSON.parse(content) });
            } catch {
                // malformed launchSettings.json: ignore the project
            }
        }

        return findStartupProjectFromLaunchSettings(entries);
    }
}

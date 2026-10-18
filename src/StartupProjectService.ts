import * as vscode from "vscode";
import * as fs from "@extensions/fs";
import * as path from "@extensions/path";
import { Solution } from "@core/Solutions";
import { isSamePath, normalizePath } from "./core/Solutions/SolutionItemSort";
import { LaunchSettingsEntry, findStartupProjectFromLaunchConfigurations, findStartupProjectFromLaunchSettings } from "./core/Solutions/StartupProjectResolver";

export class StartupProjectService implements vscode.Disposable {
    private readonly startupProjects = new Map<string, string | undefined>();
    private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();
    private readonly onDidInvalidateEmitter = new vscode.EventEmitter<void>();
    private readonly watchers: vscode.FileSystemWatcher[] = [];
    private foldersSubscription: vscode.Disposable | undefined;

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

        this.foldersSubscription = vscode.workspace.onDidChangeWorkspaceFolders(() => this.invalidate());
    }

    public unregister(): void {
        for (const watcher of this.watchers) {
            watcher.dispose();
        }
        this.watchers.length = 0;

        this.foldersSubscription?.dispose();
        this.foldersSubscription = undefined;
    }

    public getStartupProject(solutionPath: string): string | undefined {
        return this.startupProjects.get(normalizePath(solutionPath));
    }

    public isStartupProjectPath(filepath: string): boolean {
        for (const projectPath of this.startupProjects.values()) {
            if (projectPath && isSamePath(projectPath, filepath)) {
                return true;
            }
        }

        return false;
    }

    public async resolve(solution: Solution): Promise<void> {
        const key = normalizePath(solution.fullPath);
        if (this.startupProjects.has(key)) { return; }

        const current = await this.detect(solution);
        this.startupProjects.set(key, current);
        this.onDidChangeEmitter.fire();
    }

    public dispose(): void {
        this.unregister();
        this.onDidChangeEmitter.dispose();
        this.onDidInvalidateEmitter.dispose();
    }

    private invalidate(): void {
        this.startupProjects.clear();
        this.onDidInvalidateEmitter.fire();
    }

    private async detect(solution: Solution): Promise<string | undefined> {
        const projectPaths = solution.getAllProjects()
            .map(project => project.fullPath)
            .filter((projectPath): projectPath is string => !!projectPath);

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
            value => this.resolveLaunchPath(value, workspaceFolderPath),
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

    private resolveLaunchPath(value: string, workspaceFolderPath: string): string | undefined {
        const withWorkspaceFolder = value.replace(/\$\{(?:workspaceFolder|workspaceRoot)(?::([^}]+))?\}/gi,
            (_match: string, folderName: string | undefined) => {
                if (!folderName) { return workspaceFolderPath; }
                const folder = vscode.workspace.workspaceFolders?.find(f => f.name.toLowerCase() === folderName.toLowerCase());
                return folder ? folder.uri.fsPath : '';
            });

        if (/\$\{[^}]+\}/.test(withWorkspaceFolder)) { return undefined; }

        const resolved = path.isAbsolute(withWorkspaceFolder)
            ? withWorkspaceFolder
            : path.join(workspaceFolderPath, withWorkspaceFolder);
        return path.resolve(resolved);
    }
}

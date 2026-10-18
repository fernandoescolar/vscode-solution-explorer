import * as vscode from "vscode";
import { t } from "@extensions/translations";
import { StartupProjectService } from "./StartupProjectService";

export class StartupProjectDecorationProvider implements vscode.FileDecorationProvider, vscode.Disposable {
    private readonly onDidChangeFileDecorationsEmitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    private readonly subscriptions: vscode.Disposable[];
    private registration: vscode.Disposable | undefined;

    public readonly onDidChangeFileDecorations = this.onDidChangeFileDecorationsEmitter.event;

    constructor(private readonly startupProjectService: StartupProjectService) {
        const refresh = () => this.onDidChangeFileDecorationsEmitter.fire(undefined);
        this.subscriptions = [
            this.startupProjectService.onDidChange(refresh),
            this.startupProjectService.onDidInvalidate(refresh)
        ];
    }

    public register(): void {
        this.registration = vscode.window.registerFileDecorationProvider(this);
    }

    public unregister(): void {
        this.registration?.dispose();
        this.registration = undefined;
    }

    public provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
        if (uri.scheme !== 'file' || !this.startupProjectService.isStartupProjectPath(uri.fsPath)) {
            return undefined;
        }

        return {
            color: new vscode.ThemeColor('list.highlightForeground'),
            tooltip: t('Startup project')
        };
    }

    public dispose(): void {
        this.unregister();
        this.subscriptions.forEach(subscription => subscription.dispose());
        this.onDidChangeFileDecorationsEmitter.dispose();
    }
}

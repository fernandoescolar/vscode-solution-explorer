import * as vscode from "vscode";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { CommandBase } from "@commands/base";


export class LocateCommand extends CommandBase {
    private _provider: SolutionExplorerProvider;
    constructor(provider: SolutionExplorerProvider) {
        super('Locate');
        this._provider = provider;
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!vscode.window.activeTextEditor) { return Promise.resolve(); }
		return this._provider.selectFile(vscode.window.activeTextEditor.document.uri.fsPath);
    }
}
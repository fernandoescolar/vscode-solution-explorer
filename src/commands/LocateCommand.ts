import * as vscode from "vscode";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { ICommand } from "@commands/base";


export class LocateCommand implements ICommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
    }

    public run(item: TreeItem): Promise<void> {
        if (!vscode.window.activeTextEditor) { return Promise.resolve(); }
		return this.provider.selectFile(vscode.window.activeTextEditor.document.uri.fsPath);
    }
}
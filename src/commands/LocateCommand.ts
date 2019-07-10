import { CommandBase } from "./base/CommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { ContextValues } from "../tree";
import * as vscode from "vscode";


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
		this._provider.selectFile(vscode.window.activeTextEditor.document.uri.fsPath);    
    }
}
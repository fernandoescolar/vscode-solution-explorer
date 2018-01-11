import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class OpenFileCommand extends CommandBase {

    constructor() {
        super();
    }

    protected ShouldRun(item: TreeItem): boolean {
        if (item && item.path) return true; // return item && item.path; // raises an error
        return false;
    }

    protected async RunCommand(item: TreeItem, args: string[]): Promise<string[]> {    
        let filepath = item.path;
        let document = await vscode.workspace.openTextDocument(filepath);
        vscode.window.showTextDocument(document);    
        return [];
    }
}
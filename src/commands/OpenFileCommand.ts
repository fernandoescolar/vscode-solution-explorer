import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree";
import { CommandBase } from "./base/CommandBase";

export class OpenFileCommand extends CommandBase {
    private lastOpenedFile: string;
    private lastOpenedDate: Date;

    constructor() {
        super('Open file');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (item && item.path) return true; // return item && item.path; // raises an error
        return false;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {    
        let options: vscode.TextDocumentShowOptions = {
            preview: !this.checkDoubleClick(item),
            preserveFocus: true
        };
        let filepath = item.path;
        let document = await vscode.workspace.openTextDocument(filepath);
        vscode.window.showTextDocument(document, options);  
    }

    private checkDoubleClick(item: TreeItem): boolean {
        let result = false;
        if (this.lastOpenedFile && this.lastOpenedDate) {
            let isTheSameFile = this.lastOpenedFile == item.path;
            let dateDiff = <number>(<any>new Date() - <any>this.lastOpenedDate);
            result =  isTheSameFile && dateDiff < 500;
        }

        this.lastOpenedFile = item.path;
        this.lastOpenedDate = new Date();
        return result;
    }
}
import * as vscode from "vscode";
import { TreeItem } from "@tree";
import { CommandBase } from "@commands/base";

export class OpenFileCommand extends CommandBase {
    private lastOpenedFile: string | undefined;
    private lastOpenedDate: Date | undefined;

    constructor() {
        super('Open file');
    }

    protected shouldRun(item: TreeItem): boolean {
        if (item && item.path) { return true; } // return item && item.path; // raises an error
        return false;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!item || !item.path) { return; }

        const options: vscode.TextDocumentShowOptions = {
            preview: !this.checkDoubleClick(item),
            preserveFocus: true
        };
        const filepath = item.path;
        const uri = vscode.Uri.file(filepath);
        const document = await vscode.workspace.openTextDocument(uri);
        vscode.window.showTextDocument(document, options);
    }

    private checkDoubleClick(item: TreeItem): boolean {
        let result = false;
        if (this.lastOpenedFile && this.lastOpenedDate) {
            let isTheSameFile = this.lastOpenedFile === item.path;
            let dateDiff = <number>(<any>new Date() - <any>this.lastOpenedDate);
            result =  isTheSameFile && dateDiff < 500;
        }

        this.lastOpenedFile = item.path;
        this.lastOpenedDate = new Date();
        return result;
    }
}

import * as vscode from "vscode";
import { Action, ActionContext } from "./base/Action";

export class OpenFile implements Action {
    constructor(private readonly filePath: string, private readonly preview: boolean = true, private readonly focusDocument: boolean = false) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) {
            return;
        }

        const options: vscode.TextDocumentShowOptions = {
            preview: this.preview,
            preserveFocus: !this.focusDocument
        };
        const document = await vscode.workspace.openTextDocument(this.filePath);
        vscode.window.showTextDocument(document, options);
    }

    public toString(): string {
        return `Open file ${this.filePath} ${this.preview ? 'in preview' : ''}`;
    }
}



import * as vscode from "vscode";
import { Action, ActionContext } from "./base/Action";

export class RevealInOS implements Action {
    constructor(private readonly filepath: string) {
    }

    public execute(context: ActionContext): Promise<void> {
        if (!context.cancelled) {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(this.filepath));
        }

        return Promise.resolve();
    }

    toString(): string {
        return `Reveal file ${this.filepath} in OS`;
    }

}

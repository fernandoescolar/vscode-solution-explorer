import * as vscode from "vscode";
import * as path from "@extensions/path";
import * as dialogs from "@extensions/dialogs";
import { IEventAggregator, SolutionSelected } from "@events";
import { Action, ActionContext } from "./base/Action";

export class OpenSolution implements Action {
    constructor(private readonly solutionPath: string, public readonly eventAggregator: IEventAggregator) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return Promise.resolve(); }
        if (!this.solutionPath) { return Promise.resolve(); }

        if (!this.checkFolderContainsSolution()) {
            const folder = path.dirname(this.solutionPath);
            const option = await dialogs.confirm(`The folder '${folder}' is not opened in the workspace, do you want to open it?`, "Yes", "No");
            if (option === "Yes") {
                await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(folder));
            } else {
                return;
            }
        }

        const e = new SolutionSelected(this.solutionPath);
        this.eventAggregator.publish(e);
    }

    public toString(): string {
        return `Open solution: ${this.solutionPath}`;
    }

    private checkFolderContainsSolution(): boolean {
        return !!vscode.workspace.workspaceFolders
            && vscode.workspace.workspaceFolders.length > 0
            && this.solutionPath.indexOf(vscode.workspace.workspaceFolders[0].uri.fsPath) === 0;
    }

}

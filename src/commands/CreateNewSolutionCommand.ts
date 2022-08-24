import * as vscode from "vscode";
import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, CreateSolution } from "@actions";
import { ActionCommand } from "@commands/base";

export class CreateNewSolutionCommand extends ActionCommand {
    constructor() {
        super('Create solution');
    }

    protected shouldRun(item: TreeItem): boolean {
        return true;
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        const solutionName = await dialogs.getText('Solution name');
        const workingFolder = vscode.workspace.rootPath;
        if (!solutionName || !workingFolder) {
            return [];
        }

        return [ new CreateSolution(solutionName, workingFolder) ];
    }
}

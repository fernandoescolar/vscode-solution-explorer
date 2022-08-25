import * as vscode from "vscode";
import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, CreateSolution } from "@actions";
import { ActionsCommand } from "@commands";

export class CreateNewSolutionCommand extends ActionsCommand {
    constructor() {
        super('Create solution');
    }

    public  shouldRun(item: TreeItem): boolean {
        return true;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        const solutionName = await dialogs.getText('Solution name');
        const workingFolder = vscode.workspace.rootPath;
        if (!solutionName || !workingFolder) {
            return [];
        }

        return [ new CreateSolution(solutionName, workingFolder) ];
    }
}

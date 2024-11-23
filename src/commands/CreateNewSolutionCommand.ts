import * as vscode from "vscode";
import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, DotNetNewSln } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CreateNewSolutionCommand extends SingleItemActionsCommand {
    constructor() {
        super('Create solution');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return true;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        const solutionName = await dialogs.getText('Solution name');
        const workingFolder = vscode.workspace.rootPath;
        if (!solutionName || !workingFolder) {
            return [];
        }

        return [ new DotNetNewSln(solutionName, workingFolder) ];
    }
}

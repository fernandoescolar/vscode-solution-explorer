import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, CreateSolutionFolder } from "@actions";
import { ActionCommand } from "@commands/base";

export class CreateSolutionFolderCommand extends ActionCommand {
    constructor() {
        super('Create solution folder');
    }

    protected shouldRun(item: TreeItem): boolean {
        return !!item && !!item.solution;
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        const folderName = await dialogs.getText('New folder name');

        if (!folderName) {
            return [];
        }

        return [ new CreateSolutionFolder(item.solution, folderName, (<any>item).projectInSolution) ];
    }
}

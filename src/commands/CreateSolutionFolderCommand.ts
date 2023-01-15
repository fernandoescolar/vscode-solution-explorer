import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, CreateSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CreateSolutionFolderCommand extends SingleItemActionsCommand {
    constructor() {
        super('Create solution folder');
    }

    public  shouldRun(item: TreeItem): boolean {
        return !!item && !!item.solution;
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        const folderName = await dialogs.getText('New folder name');

        if (!folderName) {
            return [];
        }

        return [ new CreateSolutionFolder(item.solution, folderName, item.projectInSolution) ];
    }
}

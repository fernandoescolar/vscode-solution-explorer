import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, CreateSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class CreateSolutionFolderCommand extends SingleItemActionsCommand {
    constructor() {
        super('Create solution folder');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.solution;
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!item || !item.solution) {
            return [];
        }

        const folderName = await dialogs.getText('New folder name');
        if (!folderName) {
            return [];
        }

        return [ new CreateSolutionFolder(item.solution, folderName, item.projectInSolution) ];
    }
}

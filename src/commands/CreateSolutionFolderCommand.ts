import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, SlnCreateSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionType } from "@core/Solutions";

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
        if (item.solution.type === SolutionType.Sln) {
            return [ new SlnCreateSolutionFolder(item.solution, folderName, item.solutionItem) ];
        }

        return [];
    }
}

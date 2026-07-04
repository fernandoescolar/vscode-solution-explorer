import * as dialogs from "@extensions/dialogs";
import { TreeItem } from "@tree";
import { Action, SlnCreateSolutionFolder, SlnxCreateSolutionFolder } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionType, SolutionFolder } from "@core/Solutions";

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

        // Ensure solutionItem is either undefined (root) or a SolutionFolder
        const parentFolder = item.solutionItem instanceof SolutionFolder ? item.solutionItem : undefined;

        if (item.solution.type === SolutionType.Sln) {
            return [ new SlnCreateSolutionFolder(item.solution, folderName, parentFolder) ];
        }

        if (item.solution.type === SolutionType.Slnx) {
            return [ new SlnxCreateSolutionFolder(item.solution, folderName, parentFolder) ];
        }

        return [];
    }
}

import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Action, SlnAddSolutionFile } from "@actions";
import { SingleItemActionsCommand } from "@commands";
import { SolutionType } from "@core/Solutions";

export class AddExistingFileToSolutionFolderCommand extends SingleItemActionsCommand {
    constructor() {
        super('Add existing file to solution folder');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.solutionItem && (item.contextValue === ContextValues.solutionFolder);
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        const filePath = await dialogs.openFile('Select a file to add');
        if (!item || !item.solution || !item.solutionItem || !filePath) {
            return [];
        }

        if (item.solution.type === SolutionType.Sln) {
            return [ new SlnAddSolutionFile(item.solution, item.solutionItem, filePath) ];
        }

        return [];
    }
}



import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Action, AddSolutionFile } from "@actions";
import { SingleItemActionsCommand } from "@commands";

export class AddExistingFileToSolutionFolderCommand extends SingleItemActionsCommand {
    constructor() {
        super('Add existing file to solution folder');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return !!item && !!item.projectInSolution && (item.contextValue === ContextValues.solutionFolder);
    }

    public async getActions(item: TreeItem | undefined): Promise<Action[]> {
        const filePath = await dialogs.openFile('Select a file to add');
        if (!item || !item.solution || !item.projectInSolution || !filePath) {
            return [];
        }

        return [ new AddSolutionFile(item.solution, item.projectInSolution, filePath) ];
    }
}



import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Action, AddSolutionFile } from "@actions";
import { ActionsCommand } from "@commands";

export class AddExistingFileToSolutionFolderCommand extends ActionsCommand {
    constructor() {
        super('Add existing file to solution folder');
    }

    public shouldRun(item: TreeItem): boolean {
        return item && !!item.projectInSolution && (item.contextValue === ContextValues.solutionFolder);
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        const filePath = await dialogs.openFile('Select a file to add');
        if (!item.solution || !item.projectInSolution || !filePath) {
            return [];
        }

        return [ new AddSolutionFile(item.solution, item.projectInSolution, filePath) ];
    }
}



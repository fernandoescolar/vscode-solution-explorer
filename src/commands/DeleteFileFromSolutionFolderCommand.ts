import * as dialogs from "@extensions/dialogs";
import { ContextValues, TreeItem } from "@tree";
import { Action, DeleteSolutionFile } from "@actions";
import { ActionsCommand } from "@commands";
import { getItemNesting } from "@extensions/config";


export class DeleteFileFromSolutionFolderCommand extends ActionsCommand {
    constructor() {
        super('Delete file from solution folder');
    }

    public shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.solutionFile);
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item.solution || !item.projectInSolution || !item.path) {
            return [];
        }

        return [new DeleteSolutionFile(item.solution, item.projectInSolution, item.path)];
    }
}

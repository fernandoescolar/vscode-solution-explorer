import { ContextValues, TreeItem } from "@tree";
import { ProjectInSolution } from "@core/Solutions";
import { Action, DeleteSolutionFolder } from "@actions";
import { ActionsCommand } from "@commands";

export class RemoveSolutionFolderCommand extends ActionsCommand {
    constructor() {
        super('Remove solution folder');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && !!item.solution && item.contextValue.startsWith(ContextValues.solutionFolder);
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item.projectInSolution) {
            return [];
        }

        return [ new DeleteSolutionFolder(item.solution, item.projectInSolution) ];
    }
}

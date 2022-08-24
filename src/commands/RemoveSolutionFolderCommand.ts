import { ContextValues, TreeItem } from "@tree";
import { ProjectInSolution } from "@core/Solutions";
import { Action, DeleteSolutionFolder } from "@actions";
import { ActionCommand } from "@commands/base";

export class RemoveSolutionFolderCommand extends ActionCommand {
    constructor() {
        super('Remove solution folder');
    }

    protected shouldRun(item: TreeItem): boolean {
        return item && !!item.solution && item.contextValue.startsWith(ContextValues.solutionFolder);
    }

    protected async getActions(item: TreeItem): Promise<Action[]> {
        const projectInSolution: ProjectInSolution = (<any>item).projectInSolution;
        if (!projectInSolution) {
            return [];
        }

        return [ new DeleteSolutionFolder(item.solution, projectInSolution) ];
    }
}
